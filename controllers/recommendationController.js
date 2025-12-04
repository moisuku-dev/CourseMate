const mariadb = require('mariadb');
require('dotenv').config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

// 📏 [Helper] 두 좌표 사이의 거리 계산 (Haversine Formula)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 거리 (km)
}

// 🗺️ [Helper] 네이버 지도 앱 연동 URL 생성 (경유지 포함)
function generateNaverMapUrl(sortedSpots, startLat, startLng) {
  if (sortedSpots.length === 0) return "";

  const destination = sortedSpots[sortedSpots.length - 1]; // 마지막 장소가 도착지
  const waypoints = sortedSpots.slice(0, sortedSpots.length - 1); // 나머지는 경유지

  // nmap Scheme (앱 실행)
  let url = `nmap://route/car?slat=${startLat}&slng=${startLng}&sname=내위치`;

  // 도착지 설정
  url += `&dlat=${destination.lat}&dlng=${destination.lng}&dname=${encodeURI(destination.spotName)}`;

  // 경유지 설정
  waypoints.forEach((spot, index) => {
    url += `&v${index + 1}lat=${spot.lat}&v${index + 1}lng=${spot.lng}&v${index + 1}name=${encodeURI(spot.spotName)}`;
  });

  return url;
}

// 🤖 [Core Logic] 하이브리드 추천 엔진 (크롤링 + 유저 리뷰 + 가중치 적용)
async function mockAIRecommendation(conn, userTags, region, excludeIds = []) {
  console.log(`[Recommender] 지역: ${region}, 태그: ${userTags}`);

  // 1. 태그가 없으면 기본값 설정 (리뷰 데이터에 흔한 단어로 설정)
  if (!userTags || userTags.length === 0) {
    userTags = ['좋', '추천', '만족', '아이', '가족', '재미']; 
  }

  // 2. 제외할 ID 처리
  let excludeCondition = "";
  if (excludeIds.length > 0) {
    const idsString = excludeIds.map(id => `'${id}'`).join(",");
    excludeCondition = `AND main.SPOT_ID NOT IN (${idsString})`;
  }

  // 3. 태그 검색 조건
  const crawlConditions = userTags.map(tag => `c.KEYWORDS LIKE '%${tag.replace('#', '')}%'`).join(' OR ');
  const userConditions = userTags.map(tag => `r.CONTENT LIKE '%${tag.replace('#', '')}%'`).join(' OR ');

  // 4. 메인 쿼리 (취향 매칭)
  let query = `
    SELECT 
      main.SPOT_ID, 
      t.NAME, 
      t.ADDRESS,
      SUM(main.calc_score) as total_score
    FROM (
      SELECT 
        SPOT_ID, 
        CASE 
          WHEN SENTIMENT = 'Positive' THEN SENTIMENT_SCORE * 0.9 
          WHEN SENTIMENT = 'Negative' THEN SENTIMENT_SCORE * -0.7 
          ELSE 0 
        END as calc_score
      FROM CRAWLED_REVIEW c
      WHERE (${crawlConditions}) -- 여기가 범인! 태그가 안 맞으면 다 걸러짐
      
      UNION ALL
      
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
    GROUP BY main.SPOT_ID, t.NAME, t.ADDRESS
    HAVING total_score > 0
    ORDER BY total_score DESC
    LIMIT 3
  `;

  const params = [`%${region}%`];
  let rows = await conn.query(query, params);

  // ✨ [추가된 로직] 5. 만약 결과가 0개라면? -> 태그 조건 빼고 '지역 인기순'으로 다시 검색!
  if (rows.length === 0) {
    console.log("[Recommender] 취향에 맞는 곳이 없어 지역 인기순으로 대체합니다.");
    
    // 태그 조건(WHERE)을 뺀 쿼리 실행
    const fallbackQuery = `
      SELECT 
        t.SPOT_ID, 
        t.NAME, 
        t.ADDRESS,
        COUNT(c.CRAWL_ID) as review_count, -- 리뷰 많은 순
        AVG(c.SENTIMENT_SCORE) as avg_score 
      FROM TOUR_SPOT t
      LEFT JOIN CRAWLED_REVIEW c ON t.SPOT_ID = c.SPOT_ID
      WHERE t.ADDRESS LIKE ? 
        ${excludeCondition.replace('main.', 't.')} -- alias 수정
      GROUP BY t.SPOT_ID, t.NAME, t.ADDRESS
      ORDER BY review_count DESC, avg_score DESC
      LIMIT 3
    `;
    
    rows = await conn.query(fallbackQuery, params);
    
    // 결과 포맷 맞추기 (total_score 필드가 없으므로 가짜 점수 생성)
    rows = rows.map(row => ({
      ...row,
      total_score: Number(row.review_count) * 0.1
    }));
  }

  // 6. 점수 정규화 (로그 스케일)
  const recommended = rows.map(row => {
    const validScore = Math.max(row.total_score, 0);
    const logScore = Math.log(validScore + 1); 
    const finalScore = 0.5 + (logScore * 0.1); 
    
    return {
      spotId: row.SPOT_ID,
      matchScore: Math.min(finalScore, 0.99).toFixed(2)
    };
  });

  return recommended;
}

// 1. AI 맞춤 관광 코스 추천 (동선 최적화 포함)
exports.getRecommendations = async (req, res) => {
  let conn;
  try {
    const userId = req.query.userId || req.body.userId;
    const region = req.query.region;
    
    // 사용자의 현재 위치 (없으면 서울 시청 좌표를 기본값으로 사용)
    const currentLat = parseFloat(req.query.lat) || 37.5665; 
    const currentLng = parseFloat(req.query.lng) || 126.9780;

    if (!region) {
      return res.status(400).json({ result_code: 400, result_msg: "지역(region) 정보가 필요합니다." });
    }

    conn = await pool.getConnection();

    // 1) 사용자 취향 태그 조회
    const prefRows = await conn.query(
      "SELECT t.TAG_NAME FROM USER_PREFERENCE up JOIN TAG t ON up.TAG_ID = t.TAG_ID WHERE up.USER_ID = ?", 
      [userId]
    );
    const userTags = prefRows.map(row => row.TAG_NAME.replace('#', ''));

    // 2) 하이브리드 추천 로직 실행
    const aiResults = await mockAIRecommendation(conn, userTags, region);

    if (aiResults.length === 0) {
      return res.status(200).json({ 
        result_code: 200, 
        result_msg: `선택하신 '${region}' 지역에 맞는 추천 관광지가 없습니다.`, 
        course: [] 
      });
    }

    // 3) 상세 정보 매핑 (좌표 포함)
    let rawCourse = [];
    for (const item of aiResults) {
      const spotRows = await conn.query("SELECT SPOT_ID, NAME, ADDRESS, LATITUDE, LONGITUDE, AVG_RATING FROM TOUR_SPOT WHERE SPOT_ID = ?", [item.spotId]);
      if (spotRows.length > 0) {
        const spot = spotRows[0];
        // 태그는 임시 (추후 AI 분석 테이블 연동)
        rawCourse.push({
          spotId: spot.SPOT_ID,
          spotName: spot.NAME,
          address: spot.ADDRESS,
          lat: Number(spot.LATITUDE),
          lng: Number(spot.LONGITUDE),
          matchScore: Number(item.matchScore),
          features: ["#데이터기반", "#AI추천"]
        });
      }
    }

    // 4. 동선 최적화 (가까운 순서대로 정렬)
    let sortedCourse = [];
    let currentPos = { lat: currentLat, lng: currentLng };
    let remaining = [...rawCourse];

    while (remaining.length > 0) {
      // 현재 위치에서 가장 가까운 곳 찾기
      remaining.sort((a, b) => {
        const distA = getDistance(currentPos.lat, currentPos.lng, a.lat, a.lng);
        const distB = getDistance(currentPos.lat, currentPos.lng, b.lat, b.lng);
        return distA - distB;
      });

      const nextSpot = remaining.shift();
      sortedCourse.push(nextSpot);
      // 다음 목적지를 찾기 위해 현재 위치를 방금 찾은 곳으로 갱신
      currentPos = { lat: nextSpot.lat, lng: nextSpot.lng };
    }

    // 5. 네이버 지도 링크 생성
    const mapLink = generateNaverMapUrl(sortedCourse, currentLat, currentLng);

    res.status(200).json({
      result_code: 200,
      result_msg: "AI 맞춤 코스 추천 성공 (동선 최적화 완료)",
      course: sortedCourse,
      mapLink: mapLink
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 2. 재추천 로직 (GET /api/recommendations/retry)
exports.getRetryRecommendations = async (req, res) => {
  let conn;
  try {
    const userId = req.query.userId || req.body.userId;
    const region = req.query.region;
    const excludeIdsStr = req.query.excludeIds || ""; 
    const excludeIds = excludeIdsStr.split(',').filter(id => id.trim() !== "");
    
    // 재추천 시에도 동선 최적화를 위해 좌표 필요
    const currentLat = parseFloat(req.query.lat) || 37.5665; 
    const currentLng = parseFloat(req.query.lng) || 126.9780;

    if (!region) {
      return res.status(400).json({ result_code: 400, result_msg: "지역 정보가 필요합니다." });
    }

    conn = await pool.getConnection();

    const prefRows = await conn.query(
      "SELECT t.TAG_NAME FROM USER_PREFERENCE up JOIN TAG t ON up.TAG_ID = t.TAG_ID WHERE up.USER_ID = ?", 
      [userId]
    );
    const userTags = prefRows.map(row => row.TAG_NAME.replace('#', ''));

    // 제외 ID 포함하여 추천 재실행
    const aiResults = await mockAIRecommendation(conn, userTags, region, excludeIds);

    let rawCourse = [];
    for (const item of aiResults) {
      const spotRows = await conn.query("SELECT SPOT_ID, NAME, ADDRESS, LATITUDE, LONGITUDE, AVG_RATING FROM TOUR_SPOT WHERE SPOT_ID = ?", [item.spotId]);
      if (spotRows.length > 0) {
        const spot = spotRows[0];
        rawCourse.push({
          spotId: spot.SPOT_ID,
          spotName: spot.NAME,
          address: spot.ADDRESS,
          lat: Number(spot.LATITUDE),
          lng: Number(spot.LONGITUDE),
          matchScore: Number(item.matchScore),
          features: ["#새로운코스", "#데이터추천"]
        });
      }
    }

    // 재추천 결과에 대해서도 동선 최적화 수행
    let sortedCourse = [];
    let currentPos = { lat: currentLat, lng: currentLng };
    let remaining = [...rawCourse];

    while (remaining.length > 0) {
      remaining.sort((a, b) => {
        const distA = getDistance(currentPos.lat, currentPos.lng, a.lat, a.lng);
        const distB = getDistance(currentPos.lat, currentPos.lng, b.lat, b.lng);
        return distA - distB;
      });
      const nextSpot = remaining.shift();
      sortedCourse.push(nextSpot);
      currentPos = { lat: nextSpot.lat, lng: nextSpot.lng };
    }

    const mapLink = generateNaverMapUrl(sortedCourse, currentLat, currentLng);

    res.status(200).json({
      result_code: 200,
      result_msg: "데이터 기반 재추천 성공",
      course: sortedCourse,
      mapLink: mapLink
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};