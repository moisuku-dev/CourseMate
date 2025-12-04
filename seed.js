const mariadb = require('mariadb');
const fs = require('fs');
const csv = require('csv-parser');
const iconv = require('iconv-lite'); // ✨ 추가됨: 한글 깨짐 방지
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

async function importCsv() {
  const results = [];
  let conn;

  console.log("🚀 데이터 로딩 시작...");

  // 1. CSV 파일 읽기 (EUC-KR -> UTF-8 변환 파이프라인 추가)
  fs.createReadStream('/csv_/inputdata_서울랜드.csv')
    .pipe(iconv.decodeStream('euc-kr')) // ✨ 윈도우 CSV 한글 깨짐 해결
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      console.log(`📂 CSV 로딩 완료: ${results.length}개의 데이터를 발견했습니다.`);
      
      try {
        conn = await pool.getConnection();
        
        for (const row of results) {
          // ✨ 핵심 수정: % 제거 및 소수점 변환
          // 예: "97.07%" -> "97.07" -> 97.07 -> 0.9707
          let rawScore = row.SENTIMENT_SCORE || '0';
          let score = parseFloat(rawScore.replace('%', '')); // % 제거
          
          // 만약 점수가 1보다 크다면(97.07), 100으로 나눠서 0~1 사이로 맞춤 (DECIMAL(5,4) 대응)
          if (score > 1) {
            score = score / 100;
          }

          // DB 삽입
          await conn.query(
            `INSERT INTO CRAWLED_REVIEW (SPOT_ID, NICKNAME, CONTENT, SENTIMENT, SENTIMENT_SCORE, KEYWORDS) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              row.SPOT_ID || 'SPOT001',
              row.NICKNAME,
              row.CONTENT,
              row.SENTIMENT,
              score, // 변환된 숫자 사용
              row.KEYWORDS
            ]
          );
        }
        console.log("✅ 데이터베이스 입력 성공! (%기호 제거 및 한글 처리 완료)");
      } catch (err) {
        console.error("❌ 입력 실패:", err);
      } finally {
        if (conn) conn.end();
        process.exit();
      }
    });
}

importCsv();