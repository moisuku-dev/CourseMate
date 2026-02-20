const pool = require('../config/db_config');

const ReviewModel = {
    // 리뷰 작성
    async create({ userId, spotId, rating, content, blogUrl }) {
        const query = `
            INSERT INTO REVIEW (USER_ID, SPOT_ID, RATING, CONTENT, BLOG_URL)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.query(query, [userId, spotId, rating, content, blogUrl]);
        return result.insertId; // 생성된 리뷰 ID 반환
    },

    // 리뷰 수정
    async update({ reviewId, userId, rating, content, blogUrl }) {
        // 본인 리뷰인지 확인하기 위해 USER_ID 조건 추가
        const query = `
            UPDATE REVIEW 
            SET RATING = ?, CONTENT = ?, BLOG_URL = ?
            WHERE REVIEW_ID = ? AND USER_ID = ?
        `;
        const [result] = await pool.query(query, [rating, content, blogUrl, reviewId, userId]);
        return result.affectedRows; // 수정된 행의 개수 반환 (0이면 권한 없거나 실패)
    },

    // 리뷰 삭제
    async delete({ reviewId, userId }) {
        const query = `
            DELETE FROM REVIEW 
            WHERE REVIEW_ID = ? AND USER_ID = ?
        `;
        const [result] = await pool.query(query, [reviewId, userId]);
        return result.affectedRows;
    },

    // [관리자용] 리뷰 강제 삭제 (본인 확인 X)
    async deleteByAdmin(reviewId) {
        const query = `DELETE FROM REVIEW WHERE REVIEW_ID = ?`;
        const [result] = await pool.query(query, [reviewId]);
        return result.affectedRows;
    },
    
    // [관리자용] 전체 리뷰 목록 조회 (관리 화면용)
    async findAll() {
        const query = `
            SELECT r.*, u.NAME as nickname, t.NAME as spotName
            FROM REVIEW r
            LEFT JOIN USER u ON r.USER_ID = u.USER_ID
            LEFT JOIN TOUR_SPOT t ON r.SPOT_ID = t.SPOT_ID
            ORDER BY r.REG_DATE DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    }
};

module.exports = ReviewModel;