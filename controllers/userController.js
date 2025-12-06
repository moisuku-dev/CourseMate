const mariadb = require('mariadb');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('../database');

// Helper: DB에서 태그 ID 찾기
async function getTagIdByName(conn, tagName) {
  const rows = await conn.query("SELECT TAG_ID FROM TAG WHERE TAG_NAME = ?", [tagName]);
  return rows.length > 0 ? rows[0].TAG_ID : null;
}

// ✨ [NEW] 0. 전체 태그 목록 조회 (프론트엔드 선택 화면용)
exports.getAllTags = async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // TAG 테이블에 있는 30개 태그 반환
    const rows = await conn.query("SELECT TAG_ID, TAG_NAME FROM TAG ORDER BY TAG_ID");
    
    res.status(200).json({
      result_code: 200,
      result_msg: "전체 태그 목록 조회 성공",
      tags: rows.map(r => r.TAG_NAME) // ["#맛집", "#가성비", ...]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 1. 내 취향 태그 조회 (GET /api/users/me/preferences)
exports.getMyPreferences = async (req, res) => {
  let conn;
  try {
    const userId = req.query.userId || req.body.userId; 
    conn = await pool.getConnection();

    const query = `
      SELECT t.TAG_NAME 
      FROM USER_PREFERENCE up
      JOIN TAG t ON up.TAG_ID = t.TAG_ID
      WHERE up.USER_ID = ?
    `;
    const rows = await conn.query(query, [userId]);
    
    res.status(200).json({
      result_code: 200,
      result_msg: "취향 태그 조회 성공",
      tags: rows.map(row => row.TAG_NAME)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 2. 내 취향 태그 설정/수정 (POST /api/users/me/preferences)
exports.setMyPreferences = async (req, res) => {
  let conn;
  try {
    const { userId, tags } = req.body; // tags: ["#가성비", "#조용한"]
    conn = await pool.getConnection();

    // 1) 기존 취향 삭제
    await conn.query("DELETE FROM USER_PREFERENCE WHERE USER_ID = ?", [userId]);

    // 2) 새 취향 저장
  if (tags.length > 0) {
    // 태그 이름들로 ID를 한 번에 다 가져옴
    const tagRows = await conn.query(
      "SELECT TAG_ID FROM TAG WHERE TAG_NAME IN (?)", 
      [tags] // tags 배열을 넣으면 알아서 매칭됨 (라이브러리 버전에 따라 다를 수 있으니 주의)
      // 만약 에러나면: "WHERE TAG_NAME IN ('" + tags.join("','") + "')" 형태로 문자열 생성 필요
    );
  
    if (tagRows.length > 0) {
      const values = tagRows.map(row => [userId, row.TAG_ID]);
     // Bulk Insert 쿼리
      await conn.batch(
        "INSERT INTO USER_PREFERENCE (USER_ID, TAG_ID) VALUES (?, ?)",
        values
      );
    }
  }

    res.status(200).json({
      result_code: 200,
      result_msg: "취향 태그 설정 성공"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 3. 내 위시리스트 조회 (GET /api/users/me/wishlist) 
exports.getMyWishlist = async (req, res) => {
  let conn;
  try {
    const userId = req.query.userId || req.body.userId;
    conn = await pool.getConnection();

    const query = `
      SELECT w.SPOT_ID, ts.NAME as spotName, w.REG_DATE
      FROM WISHLIST w
      JOIN TOUR_SPOT ts ON w.SPOT_ID = ts.SPOT_ID
      WHERE w.USER_ID = ?
      ORDER BY w.REG_DATE DESC
    `;
    const rows = await conn.query(query, [userId]);

    res.status(200).json({
      result_code: 200,
      result_msg: "위시리스트 조회 성공",
      wishlist: rows // spotId, spotName, regDate 포함
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 4. 내 위시리스트 추가 (POST /api/users/me/wishlist) 
exports.addToWishlist = async (req, res) => {
  let conn;
  try {
    const { userId, spotId } = req.body;
    const wishlistId = 'WL' + Date.now();

    conn = await pool.getConnection();

    // 중복 체크 (이미 찜한 경우)
    const check = await conn.query("SELECT * FROM WISHLIST WHERE USER_ID = ? AND SPOT_ID = ?", [userId, spotId]);
    if (check.length > 0) {
      return res.status(200).json({ result_code: 200, result_msg: "이미 위시리스트에 존재합니다.", wishlistId: check[0].WISHLIST_ID });
    }

    await conn.query("INSERT INTO WISHLIST (WISHLIST_ID, USER_ID, SPOT_ID) VALUES (?, ?, ?)", [wishlistId, userId, spotId]);

    res.status(200).json({
      result_code: 200,
      result_msg: "위시리스트에 관광지 추가 성공",
      wishlistId: wishlistId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 5. 내 위시리스트 삭제 (DELETE /api/users/me/wishlist/:placeId) 
exports.deleteFromWishlist = async (req, res) => {
  let conn;
  try {
    const { placeId } = req.params;
    // DELETE 메서드는 body를 잘 안쓰므로 query로 받거나 header로 받아야 하지만, 테스트 편의상 query 허용
    const userId = req.query.userId || req.body.userId; 

    conn = await pool.getConnection();
    await conn.query("DELETE FROM WISHLIST WHERE USER_ID = ? AND SPOT_ID = ?", [userId, placeId]);

    res.status(200).json({ result_code: 200, result_msg: "위시리스트에서 관광지 삭제 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 6. 내가 작성한 리뷰 조회 (GET /api/users/me/reviews) 
exports.getMyReviews = async (req, res) => {
  let conn;
  try {
    const userId = req.query.userId || req.body.userId;
    conn = await pool.getConnection();

    const query = `
      SELECT r.REVIEW_ID, ts.NAME as spotName, r.RATING, r.CONTENT, r.REG_DATE
      FROM REVIEW r
      JOIN TOUR_SPOT ts ON r.SPOT_ID = ts.SPOT_ID
      WHERE r.USER_ID = ?
      ORDER BY r.REG_DATE DESC
    `;
    const rows = await conn.query(query, [userId]);

    res.status(200).json({
      result_code: 200,
      result_msg: "작성 리뷰 조회 성공",
      reviews: rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 7. 내 계정 설정 조회 (GET /api/users/me/settings) 
exports.getMySettings = async (req, res) => {
  let conn;
  try {
    const userId = req.query.userId || req.body.userId;
    conn = await pool.getConnection();

    const rows = await conn.query("SELECT NAME, EMAIL, AGE, GENDER, IS_ACTIVE FROM USER WHERE USER_ID = ?", [userId]);
    
    if (rows.length === 0) return res.status(404).json({ result_code: 404, result_msg: "사용자 없음" });

    res.status(200).json({
      result_code: 200,
      result_msg: "계정 설정 조회 성공",
      setting: rows[0]
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 8. 내 계정 정보 수정 (PUT /api/users/me/settings) 
exports.updateMySettings = async (req, res) => {
  let conn;
  try {
    // password가 있으면 암호화해서 업데이트, 없으면 다른 정보만 업데이트
    const { userId, name, age, gender, password } = req.body;
    conn = await pool.getConnection();

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await conn.query("UPDATE USER SET NAME=?, AGE=?, GENDER=?, PASSWORD=? WHERE USER_ID=?", [name, age, gender, hashedPassword, userId]);
    } else {
      await conn.query("UPDATE USER SET NAME=?, AGE=?, GENDER=? WHERE USER_ID=?", [name, age, gender, userId]);
    }

    res.status(200).json({ result_code: 200, result_msg: "계정 정보 수정 성공" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};

// 9. 회원 탈퇴 (DELETE /api/users/me) 
exports.deleteAccount = async (req, res) => {
  let conn;
  try {
    // 탈퇴는 민감하므로 비밀번호 확인 필수 
    const { userId, password } = req.body; 
    conn = await pool.getConnection();

    const rows = await conn.query("SELECT PASSWORD FROM USER WHERE USER_ID = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ result_code: 404, result_msg: "사용자 없음" });

    // 비밀번호 확인
    const isMatch = await bcrypt.compare(password, rows[0].PASSWORD);
    if (!isMatch) {
      return res.status(200).json({ result_code: 403, result_msg: "비밀번호가 일치하지 않아 탈퇴할 수 없습니다." });
    }

    // 탈퇴 처리 (실제 삭제)
    await conn.query("DELETE FROM USER WHERE USER_ID = ?", [userId]);

    res.status(200).json({ result_code: 200, result_msg: "회원 탈퇴 성공. 모든 정보가 삭제되었습니다." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ result_code: 500, result_msg: "서버 오류" });
  } finally {
    if (conn) conn.end();
  }
};