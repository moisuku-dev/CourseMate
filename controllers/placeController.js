const mariadb = require('mariadb');
require('dotenv').config();

// database.js로 분리하셨다면 require('../database')로 쓰시고, 아니면 아래 유지하세요.
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

// 1. 관광지 목록 조회 (썸네일 포함)
exports.getPlaces = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    
    // 쿼리 파라미터: category, keyword, region
    const { category, keyword, region } = req.query;

    // ✨ [핵심 수정] 서브쿼리를 사용하여 대표 사진(thumbnail) 1장만 가져옵니다.
    // (SELECT IMG_URL FROM PHOTO WHERE SPOT_ID = t.SPOT_ID LIMIT 1)
    let sql = `
      SELECT 
        t.*, 
        (SELECT IMG_URL FROM PHOTO p WHERE p.SPOT_ID = t.SPOT_ID ORDER BY p.PHOTO_ID ASC LIMIT 1) as thumbnail 
      FROM TOUR_SPOT t 
      WHERE 1=1
    `;
    
    let params = [];

    // 1) 지역 필터
    if (region) {
      sql += " AND t.ADDRESS LIKE ?";
      params.push(`%${region}%`);
    }

    // 2) 카테고리 필터
    if (category) {
      sql += " AND t.CATEGORY = ?";
      params.push(category);
    }

    // 3) 검색어 필터
    if (keyword) {
      sql += " AND t.NAME LIKE ?";
      params.push(`%${keyword}%`);
    }

    // 정렬 (최신순 또는 ID순)
    sql += " ORDER BY t.SPOT_ID ASC";

    const rows = await conn.query(sql, params);

    res.status(200).json({
      result_code: 200,
      result_msg: "관광지 목록 조회 성공",
      totalCount: rows.length,
      places: rows // 각 객체 안에 thumbnail 필드가 포함됨
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 2. 관광지 상세 정보 조회 (사진 목록 포함)
exports.getPlaceDetail = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const { id } = req.params; // spotId

    // 1) 관광지 기본 정보 조회
    const placeRows = await conn.query("SELECT * FROM TOUR_SPOT WHERE SPOT_ID = ?", [id]);

    if (placeRows.length === 0) {
      return res.status(404).json({ result_code: 404, result_msg: "존재하지 않는 관광지입니다." });
    }

    const place = placeRows[0];

    // 2) ✨ [핵심 수정] 해당 관광지의 모든 사진 조회
    const photoRows = await conn.query(
      "SELECT PHOTO_ID, IMG_URL FROM PHOTO WHERE SPOT_ID = ? ORDER BY PHOTO_ID ASC", 
      [id]
    );

    // 3) 데이터를 합쳐서 응답
    // photos 배열에 이미지 URL만 담아서 줄지, 객체로 줄지 선택 가능 (여기선 객체 유지)
    res.status(200).json({
      result_code: 200,
      result_msg: "관광지 상세 정보 조회 성공",
      place: {
        ...place,
        photos: photoRows // [{ PHOTO_ID: 1, IMG_URL: '...' }, ...]
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};