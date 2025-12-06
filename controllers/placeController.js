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

// 1. 관광지 목록 조회 및 검색 (지역, 카테고리, 키워드 필터)
exports.getPlaces = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    const { category, keyword, region } = req.query;

    let sql = "SELECT SPOT_ID, NAME, ADDRESS, CATEGORY, AVG_RATING FROM TOUR_SPOT WHERE 1=1";
    let params = [];

    // 1) 지역 필터 (주소 검색)
    if (region) {
      sql += " AND ADDRESS LIKE ?";
      params.push(`%${region}%`);
    }

    // 2) 카테고리 필터
    if (category) {
      sql += " AND CATEGORY = ?";
      params.push(category);
    }

    // 3) 검색어 필터
    if (keyword) {
      sql += " AND NAME LIKE ?";
      params.push(`%${keyword}%`);
    }

    // 정렬: 평점 높은 순, 혹은 이름 순
    sql += " ORDER BY AVG_RATING DESC LIMIT 100"; 

    const rows = await conn.query(sql, params);

    res.status(200).json({
      result_code: 200,
      result_msg: "관광지 목록 조회 성공",
      totalCount: rows.length,
      places: rows
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 2. 관광지 상세 정보 조회 (사진 + 태그 포함) ✨ 핵심 수정
exports.getPlaceDetail = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params; // spotId

    // (1) 기본 정보 조회
    const placeRows = await conn.query(
      "SELECT SPOT_ID, NAME, ADDRESS, CATEGORY, AVG_RATING FROM TOUR_SPOT WHERE SPOT_ID = ?", 
      [id]
    );

    if (placeRows.length === 0) {
      return res.status(404).json({ result_code: 404, result_msg: "존재하지 않는 관광지입니다." });
    }

    const place = placeRows[0];

    // (2) 사진 목록 조회 (PHOTO 테이블)
    const photoRows = await conn.query(
      "SELECT IMG_URL FROM PHOTO WHERE SPOT_ID = ?", 
      [id]
    );
    place.photos = photoRows.map(p => p.IMG_URL); // 배열로 변환

    // (3) 대표 태그 조회 (점수 높은 순 Top 5)
    const tagRows = await conn.query(
      "SELECT TAG_NAME FROM SPOT_TAG_SCORES WHERE SPOT_ID = ? ORDER BY SCORE DESC LIMIT 5",
      [id]
    );
    place.topTags = tagRows.map(t => '#' + t.TAG_NAME); // 예: ["#뷰맛집", "#야경명소"]

    res.status(200).json({
      result_code: 200,
      result_msg: "관광지 상세 정보 조회 성공",
      place: place
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};