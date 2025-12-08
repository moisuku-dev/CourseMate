# -*- coding: utf-8 -*-
import pandas as pd
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset
from transformers import BertModel, AutoTokenizer
import numpy as np
from tqdm import tqdm  # 진행률 바 표시
import json
import os

# ==========================================
# 1. 설정 (학습 환경과 동일하게!)
# ==========================================
MODEL_NAME = "klue/bert-base"  # ✅ KLUE 모델로 변경됨
MAX_LEN = 128
BATCH_SIZE = 64  # 추론은 빠르니까 64로 설정 (메모리 터지면 32로 줄이세요)
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

DATA_FILE = "total_merged_data.csv"   # 90,000개 원본 데이터
MODEL_FILE = "course_mate_model.pt"   # 학습된 모델 파일
TAGS_FILE = "tags.json"               # 태그 순서 파일

# ==========================================
# 2. 태그 리스트 로드 (안전장치)
# ==========================================
if not os.path.exists(TAGS_FILE):
    print(f"❌ 오류: '{TAGS_FILE}' 파일이 없습니다.")
    print("   -> create_dataset.py를 먼저 실행하세요!")
    exit()

with open(TAGS_FILE, "r", encoding="utf-8") as f:
    FINAL_TAGS = json.load(f)
print(f"✅ 태그 리스트 로드 완료! (총 {len(FINAL_TAGS)}개)")

# ==========================================
# 3. 모델 & 데이터셋 클래스 정의
# ==========================================
class KoBERTClass(nn.Module):
    def __init__(self, num_labels):
        super(KoBERTClass, self).__init__()
        self.bert = BertModel.from_pretrained(MODEL_NAME)
        self.classifier = nn.Linear(768, num_labels)

    def forward(self, input_ids, attention_mask, token_type_ids):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids)
        return self.classifier(output.pooler_output)

class InferenceDataset(Dataset):
    def __init__(self, texts, tokenizer, max_len):
        self.texts = texts
        self.tokenizer = tokenizer
        self.max_len = max_len
        
    def __len__(self):
        return len(self.texts)
    
    def __getitem__(self, index):
        text = str(self.texts[index])
        inputs = self.tokenizer.encode_plus(
            text, None, add_special_tokens=True, max_length=self.max_len,
            padding='max_length', return_token_type_ids=True, truncation=True
        )
        return {
            'ids': torch.tensor(inputs['input_ids'], dtype=torch.long),
            'mask': torch.tensor(inputs['attention_mask'], dtype=torch.long),
            'token_type_ids': torch.tensor(inputs['token_type_ids'], dtype=torch.long)
        }

# ==========================================
# 4. 메인 실행 함수
# ==========================================
def run_batch_processing():
    print(f"📂 데이터 로딩 중... ({DATA_FILE})")
    try:
        df = pd.read_csv(DATA_FILE)
    except:
        print("❌ 데이터 파일이 없습니다.")
        return

    # 가게 이름이 없으면 그룹화 불가능
    if 'store_name' not in df.columns:
        print("❌ 'store_name' 컬럼이 없습니다! 데이터 파일을 확인하세요.")
        return

    print(f"📊 총 {len(df)}개 리뷰 분석 시작! (GPU: {DEVICE})")

    # 모델 & 토크나이저 로드
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    model = KoBERTClass(len(FINAL_TAGS))
    
    try:
        model.load_state_dict(torch.load(MODEL_FILE, map_location=DEVICE))
    except:
        print("❌ 모델 파일(.pt)이 없거나 손상되었습니다.")
        return
        
    model.to(DEVICE)
    model.eval()

    # 데이터 로더 준비
    dataset = InferenceDataset(df['content'].tolist(), tokenizer, MAX_LEN)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False)

    # 예측 루프
    all_predictions = []
    print("🚀 전체 리뷰 분석 중... (잠시만 기다리세요)")
    
    with torch.no_grad():
        for data in tqdm(dataloader):
            ids = data['ids'].to(DEVICE)
            mask = data['mask'].to(DEVICE)
            token_type_ids = data['token_type_ids'].to(DEVICE)

            outputs = model(ids, mask, token_type_ids)
            probs = torch.sigmoid(outputs).cpu().numpy()
            all_predictions.extend(probs)

    # 예측 결과를 데이터프레임으로 변환
    pred_df = pd.DataFrame(all_predictions, columns=FINAL_TAGS)
    
    # 원본 데이터(가게 이름)와 예측 결과 결합
    result_df = pd.concat([df[['store_name']], pred_df], axis=1)

    print("\n🏗️ 장소별 태그 점수 집계 중 (평균 점수 계산)...")
    
    # [핵심] 같은 장소(store_name)끼리 묶어서 점수 평균 내기
    spot_scores = result_df.groupby('store_name')[FINAL_TAGS].mean()

    # 저장
    output_filename = "spot_tag_scores.csv"
    spot_scores.to_csv(output_filename, encoding='utf-8-sig')
    
    print("-" * 30)
    print(f"🎉 작업 완료! 결과 파일: {output_filename}")
    print("👉 이 파일을 다운로드해서 백엔드 DB(SPOT_FEATURE)에 넣으세요!")
    print("-" * 30)
    print(spot_scores.head())

if __name__ == "__main__":
    run_batch_processing()
