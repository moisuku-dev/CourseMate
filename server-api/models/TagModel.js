const pool = require('../config/db_config');

const TagModel = {
    // 태그 ID 찾기 (없으면 생성 후 ID 반환)
    async getOrInsertTagId(tagName) {
        // 태그 조회
        const [rows] = await pool.query('SELECT TAG_ID FROM TAG WHERE TAG_NAME = ?', [tagName]);
        if (rows.length > 0) return rows[0].TAG_ID;

        // 없으면 생성
        const [result] = await pool.query('INSERT INTO TAG (TAG_NAME) VALUES (?)', [tagName]);
        return result.insertId;
    },

    // 관광지에 태그 연결 (점수 포함, 이미 있으면 업데이트)
    async insertOrUpdateSpotFeature(spotId, tagId, score) {
        const query = `
            INSERT INTO SPOT_FEATURE (SPOT_ID, TAG_ID, SCORE)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE SCORE = ?
        `;
        await pool.query(query, [spotId, tagId, score, score]);
    },

    // 특정 관광지의 태그 목록 조회
    async getTagsBySpotId(spotId) {
        const query = `
            SELECT t.TAG_ID, t.TAG_NAME, sf.SCORE
            FROM SPOT_FEATURE sf
            JOIN TAG t ON sf.TAG_ID = t.TAG_ID
            WHERE sf.SPOT_ID = ?
            ORDER BY sf.SCORE DESC
        `;
        const [rows] = await pool.query(query, [spotId]);
        return rows;
    },

    // 관광지 태그 삭제
    async deleteSpotFeature(spotId, tagId) {
        const query = `DELETE FROM SPOT_FEATURE WHERE SPOT_ID = ? AND TAG_ID = ?`;
        const [result] = await pool.query(query, [spotId, tagId]);
        return result.affectedRows;
    },
    
    // 관광지명으로 ID 찾기
    async findSpotIdByName(spotName) {
        const [rows] = await pool.query('SELECT SPOT_ID FROM TOUR_SPOT WHERE NAME = ?', [spotName]);
        return rows.length > 0 ? rows[0].SPOT_ID : null;
    }
};

module.exports = TagModel;