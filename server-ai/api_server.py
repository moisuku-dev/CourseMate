# -*- coding: utf-8 -*-
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torch
from torch import nn
from transformers import BertModel, AutoTokenizer
import uvicorn
import json
import os
import re

# ==========================================
# 1. 경로 및 환경 설정 (폴더 구조 반영)
# ==========================================
# 현재 파일(main.py)의 위치를 기준으로 경로를 잡습니다.
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# 모델 파일 경로: src 폴더 밖으로 나가서(..) models 폴더로 진입
MODEL_FILE = os.path.join(BASE_DIR, "../models/course_mate_model.pt")

# 태그 파일 경로: src 폴더 안에 같이 있음
TAGS_FILE = os.path.join(BASE_DIR, "tags.json")

# 설정값
MODEL_NAME = "klue/bert-base"
MAX_LEN = 128
DEVICE = 'cuda' if torch.cuda.is_available() else 'cpu'
SERVER_PORT = 65030  # 🚨 학교 팀 전용 포트

# ==========================================
# 2. 태그 리스트 로드
# ==========================================
if not os.path.exists(TAGS_FILE):
    print(f"❌ 오류: '{TAGS_FILE}' 파일이 없습니다.")
    print("   -> tags.json 파일이 main.py와 같은 폴더에 있는지 확인하세요.")
    exit()

with open(TAGS_FILE, "r", encoding="utf-8") as f:
    FINAL_TAGS = json.load(f)
print(f"✅ 태그 리스트 로드 완료! (총 {len(FINAL_TAGS)}개)")

# ==========================================
# 3. 전처리 함수
# ==========================================
def clean_text(text):
    text = re.sub(r'<[^>]+>', '', text)
    text = re.sub(r'[^가-힣a-zA-Z0-9\s.,!?]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text

# ==========================================
# 4. 모델 클래스 정의
# ==========================================
class KoBERTClass(nn.Module):
    def __init__(self, num_labels):
        super(KoBERTClass, self).__init__()
        self.bert = BertModel.from_pretrained(MODEL_NAME)
        self.classifier = nn.Linear(768, num_labels)

    def forward(self, input_ids, attention_mask, token_type_ids):
        output = self.bert(input_ids=input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids)
        return self.classifier(output.pooler_output)

# ==========================================
# 5. 서버 초기화 및 모델 로드
# ==========================================
app = FastAPI(title="CourseMate AI Server")

print(f"⏳ AI 모델을 로딩 중입니다... (경로: {MODEL_FILE})")
try:
    model = KoBERTClass(len(FINAL_TAGS))
    model.load_state_dict(torch.load(MODEL_FILE, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    print("✅ 모델 로드 완료! AI가 준비되었습니다.")
except Exception as e:
    print(f"❌ 모델 로드 실패: {e}")
    print("   -> Tip: '../models/course_mate_model.pt' 경로에 파일이 있는지 확인하세요.")
    exit()

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

# ==========================================
# 6. API 엔드포인트
# ==========================================
class ReviewRequest(BaseModel):
    review: str  # 백엔드 요청 키값 ("review")

@app.post("/analyze/review")
async def analyze_review(request: ReviewRequest):
    origin_text = request.review
    
    # 1. 전처리
    cleaned_text = clean_text(origin_text)
    
    # 2. 토크나이징
    inputs = tokenizer.encode_plus(
        cleaned_text, None, add_special_tokens=True, max_length=MAX_LEN,
        padding='max_length', return_token_type_ids=True, truncation=True
    )

    ids = torch.tensor(inputs['input_ids'], dtype=torch.long).unsqueeze(0).to(DEVICE)
    mask = torch.tensor(inputs['attention_mask'], dtype=torch.long).unsqueeze(0).to(DEVICE)
    token_type_ids = torch.tensor(inputs['token_type_ids'], dtype=torch.long).unsqueeze(0).to(DEVICE)

    # 3. 추론
    with torch.no_grad():
        outputs = model(ids, mask, token_type_ids)
    
    probs = torch.sigmoid(outputs).cpu().numpy()[0]
    
    # 4. 결과 정리
    results = []
    for i, prob in enumerate(probs):
        if prob > 0.5:
            results.append({
                "tag": FINAL_TAGS[i],
                "score": round(float(prob), 4)
            })
            
    # 5. 반환
    return {
        "result_code": 200,
        "detected_tags": results
    }

# ==========================================
# 7. 서버 실행
# ==========================================
if __name__ == "__main__":
    print(f"🚀 AI 서버 가동 시작! 포트: {SERVER_PORT}")
    uvicorn.run(app, host="0.0.0.0", port=SERVER_PORT)
