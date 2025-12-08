# -*- coding: utf-8 -*-
import pandas as pd
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset
from transformers import BertModel, AutoTokenizer
from sklearn.model_selection import train_test_split
from sklearn.metrics import f1_score, accuracy_score, classification_report
import numpy as np
from tqdm import tqdm
import json
import os
import ast

# ==========================================
# 1. 설정 (학습 환경과 동일)
# ==========================================
MODEL_NAME = "klue/bert-base"
MAX_LEN = 128
BATCH_SIZE = 64
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'

DATA_FILE = "final_dataset_for_ai.csv"
MODEL_FILE = "course_mate_model.pt"
TAGS_FILE = "tags.json"

# ==========================================
# 2. 데이터 및 모델 클래스 정의
# ==========================================
if not os.path.exists(TAGS_FILE):
    print(f"❌ 오류: {TAGS_FILE} 파일이 없습니다.")
    exit()

with open(TAGS_FILE, "r", encoding="utf-8") as f:
    FINAL_TAGS = json.load(f)

class KoBERTClass(nn.Module):
    def __init__(self, num_labels):
        super(KoBERTClass, self).__init__()
        self.bert = BertModel.from_pretrained(MODEL_NAME)
        self.classifier = nn.Linear(768, num_labels)

    def forward(self, input_ids, attention_mask, token_type_ids):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids)
        return self.classifier(output.pooler_output)

class ReviewDataset(Dataset):
    def __init__(self, df, tokenizer, max_len):
        self.df = df
        self.tokenizer = tokenizer
        self.max_len = max_len
        
    def __len__(self):
        return len(self.df)
    
    def __getitem__(self, index):
        row = self.df.iloc[index]
        text = str(row['cleaned_content'])
        try:
            labels = ast.literal_eval(row['label']) # 정답 라벨
        except:
            labels = [0] * len(FINAL_TAGS)

        inputs = self.tokenizer.encode_plus(
            text, None, add_special_tokens=True, max_length=self.max_len,
            padding='max_length', return_token_type_ids=True, truncation=True
        )
        return {
            'ids': torch.tensor(inputs['input_ids'], dtype=torch.long),
            'mask': torch.tensor(inputs['attention_mask'], dtype=torch.long),
            'token_type_ids': torch.tensor(inputs['token_type_ids'], dtype=torch.long),
            'targets': torch.tensor(labels, dtype=torch.float)
        }

# ==========================================
# 3. 평가 실행 함수
# ==========================================
def evaluate():
    print(f"📂 데이터 로딩 중... ({DATA_FILE})")
    df = pd.read_csv(DATA_FILE)
    
    # 🚨 중요: 라벨링이 안 된 원본 파일이라면 라벨링부터 다시 해야 함
    if 'label' not in df.columns:
        print("⚠️ 주의: 데이터에 'label' 컬럼이 없습니다. create_dataset.py의 로직으로 라벨을 생성합니다.")
        from create_dataset import create_label # create_dataset.py가 같은 폴더에 있어야 함
        df['label'] = df['tokenized_words'].apply(create_label)

    # 학습 때와 똑같은 기준으로 8:2 분리 (random_state=42 필수!)
    _, test_df = train_test_split(df, test_size=0.2, random_state=42)
    print(f"📊 평가용 데이터(Test Set): {len(test_df)}개")

    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
    dataset = ReviewDataset(test_df, tokenizer, MAX_LEN)
    dataloader = DataLoader(dataset, batch_size=BATCH_SIZE, shuffle=False)

    model = KoBERTClass(len(FINAL_TAGS))
    model.load_state_dict(torch.load(MODEL_FILE, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()

    print("🚀 평가 시작 (Inference)...")
    all_targets = []
    all_preds = []

    with torch.no_grad():
        for data in tqdm(dataloader):
            ids = data['ids'].to(DEVICE)
            mask = data['mask'].to(DEVICE)
            token_type_ids = data['token_type_ids'].to(DEVICE)
            targets = data['targets'].cpu().numpy()

            outputs = model(ids, mask, token_type_ids)
            probs = torch.sigmoid(outputs).cpu().numpy()
            
            # 확률 0.5 이상이면 1, 아니면 0으로 변환
            preds = (probs > 0.5).astype(int)

            all_targets.extend(targets)
            all_preds.extend(preds)

    # ==========================================
    # 4. 점수 계산 (설계서 기준)
    # ==========================================
    macro_f1 = f1_score(all_targets, all_preds, average='macro')
    micro_f1 = f1_score(all_targets, all_preds, average='micro')
    accuracy = accuracy_score(all_targets, all_preds)

    print("\n" + "="*40)
    print(f"🏆 [최종 모델 평가 리포트]")
    print(f"🔹 모델명: {MODEL_NAME} (Fine-tuned)")
    print("="*40)
    print(f"✅ Macro F1 Score : {macro_f1:.4f}  (설계서 목표: 0.75 이상)")
    print(f"✅ Micro F1 Score : {micro_f1:.4f}")
    print(f"✅ Exact Accuracy : {accuracy:.4f}")
    print("-" * 40)
    
    # 상세 리포트 (태그별 점수)
    print("\n[태그별 상세 점수]")
    print(classification_report(all_targets, all_preds, target_names=FINAL_TAGS, zero_division=0))

if __name__ == "__main__":
    evaluate()
