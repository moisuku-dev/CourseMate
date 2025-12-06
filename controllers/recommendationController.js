const mariadb = require('mariadb');
require('dotenv').config();

const pool = require('../database');

// 🗺️ [Helper] 네이버 지도 검색 URL 생성
// 좌표 없이 '장소 이름'으로 검색하는 링크입니다.
// 앱에서 이 링크가 열리면 해당 장소가 지도에 뜨고, 사용자가 [도착] 버튼을 눌러 길을 찾을 수 있습니다.
function generateNaverSearchUrl(spotName) {
  if (!spotName) return "";
  return `nmap://search?query=${encodeURI(spotName)}&appname=coursemate`;
}

// 🤖 [Core Logic] 하이브리드 추천 엔진 (좌표 제외, 점수 중심)
async function mockAIRecommendation(conn, userTags, region, excludeIds = []) {
  console.log(`[Simple Hybrid Recommender] 지역: ${region}, 태그: ${userTags}`);

  if (!userTags || userTags.length === 0) {
    userTags = ['좋다', '추천', '만족']; 
  }

  // 1. 제외할 ID 처리
  let excludeCondition = "";
  if (excludeIds.length > 0) {
    const idsString = excludeIds.map(id => `'${id}'`).join(",");
    excludeCondition = `AND main.SPOT_ID NOT IN (${idsString})`;
  }

  // 2. 검색 조건 생성
  const crawlConditions = userTags.map(tag => `c.KEYWORDS LIKE '%${tag.replace('#', '')}%'`).join(' OR ');
  const userConditions = userTags.map(tag => `r.CONTENT LIKE '%${tag.replace('#', '')}%'`).join(' OR ');

  // 3. ✨ 핵심 쿼리: 좌표 없이 점수만 계산
  const query = `
    SELECT 
      main.SPOT_ID, 
      t.NAME, 
      t.ADDRESS,
      t.CATEGORY,
      t.AVG_RATING,
      SUM(main.calc_score) as total_score
    FROM (
      -- 1) 크롤링 데이터: 감성 점수 가중치 (0.9 / -0.7)
      SELECT 
        SPOT_ID, 
        CASE 
          WHEN SENTIMENT = 'Positive' THEN SENTIMENT_SCORE * 0.9 
          WHEN SENTIMENT = 'Negative' THEN SENTIMENT_SCORE * -0.7 
          ELSE 0 
        END as calc_score
      FROM CRAWLED_REVIEW c
      WHERE (${crawlConditions})
      
      UNION ALL
      
      -- 2) 앱 유저 리뷰: 가중치 1.3배
      SELECT 
        SPOT_ID, 
        CASE 
          WHEN SENTIMENT = 'P' THEN (RATING / 5.0) * 1.3 
          WHEN SENTIMENT = 'N' THEN (RATING / 5.0) * -1.3 
          ELSE 0 
        END as calc_score
      FROM REVIEW r
      WHERE (${userConditions})
    ) main
    JOIN TOUR_SPOT t ON main.SPOT_ID = t.SPOT_ID
    WHERE t.ADDRESS LIKE ? 
      ${excludeCondition}
    GROUP BY main.SPOT_ID, t.NAME, t.ADDRESS, t.CATEGORY, t.AVG_RATING
    HAVING total_score > 0 
    ORDER BY total_score DESC
    LIMIT 3
  `;

  const params = [`%${region}%`];
  let rows = await conn.query(query, params);

  // 4. [Fallback] 결과가 없을 때: 해당 지역 인기순(평점순) 추천
  if (rows.length === 0) {
    console.log("[Recommender] 취향 매칭 실패 -> 지역 인기순 대체");
    
    const fallbackQuery = `
      SELECT 
        SPOT_ID, NAME, ADDRESS, CATEGORY, AVG_RATING, 
        0.5 as total_score -- 기본 점수 부여
      FROM TOUR_SPOT
      WHERE ADDRESS LIKE ?
        ${excludeCondition.replace('main.', '')}
      ORDER BY AVG_RATING DESC
      LIMIT 3
    `;
    rows = await conn.query(fallbackQuery, params);
  }

  // 5. 결과 매핑 (좌표 제거됨)
  return rows.map(row => {
    // 점수 로그 스케일링 (0 ~ 0.99)
    const validScore = Math.max(row.total_score, 0);
    const logScore = Math.log(validScore + 1); 
    const finalScore = 0.5 + (logScore * 0.1); 
    
    return {
      spotId: row.SPOT_ID,
      spotName: row.NAME,
      address: row.ADDRESS,
      matchScore: Math.min(finalScore, 0.99).toFixed(2),
      features: ["#AI추천", "#취향저격"] // 임시 태그
    };
  });
}

// 1. 추천 API (좌표 파라미터 제거)
exports.getRecommendations = async (req, res) => {
  let conn;
  try {
    const userId = req.query.userId || req.body.userId;
    const region = req.query.region;
    
    // ❌ lat, lng 받지 않음

    if (!region) {
      return res.status(400).json({ result_code: 400, result_msg: "지역(region) 정보가 필요합니다." });
    }

    conn = await pool.getConnection();

    // 취향 태그 조회
    const prefRows = await conn.query(
      "SELECT t.TAG_NAME FROM USER_PREFERENCE up JOIN TAG t ON up.TAG_ID = t.TAG_ID WHERE up.USER_ID = ?", 
      [userId]
    );
    const userTags = prefRows.map(row => row.TAG_NAME.replace('#', ''));

    // 추천 실행
    const course = await mockAIRecommendation(conn, userTags, region);

    if (course.length === 0) {
      return res.status(200).json({ result_code: 200, result_msg: "추천 결과 없음", course: [] });
    }

    // 1순위 장소에 대한 지도 링크 생성
    const mapLink = generateNaverSearchUrl(course[0].spotName);

    res.status(200).json({
      result_code: 200,
      result_msg: "맞춤 관광지 추천 성공",
      course: course,
      mapLink: mapLink
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

