const pool = require('../config/db_config');

const CommunityModel = {
    // ==========================
    // [공지사항] Notice
    // ==========================
    async createNotice({ userId, title, content }) {
        const query = `INSERT INTO NOTICE (USER_ID, TITLE, CONTENT) VALUES (?, ?, ?)`;
        const [result] = await pool.query(query, [userId, title, content]);
        return result.insertId;
    },

    async findAllNotices() {
        const query = `SELECT * FROM NOTICE ORDER BY REG_DATE DESC`;
        const [rows] = await pool.query(query);
        return rows;
    },

    async updateNotice({ noticeId, title, content }) {
        const query = `UPDATE NOTICE SET TITLE = ?, CONTENT = ? WHERE NOTICE_ID = ?`;
        const [result] = await pool.query(query, [title, content, noticeId]);
        return result.affectedRows;
    },

    async deleteNotice(noticeId) {
        const query = `DELETE FROM NOTICE WHERE NOTICE_ID = ?`;
        const [result] = await pool.query(query, [noticeId]);
        return result.affectedRows;
    },

    // ==========================
    // [커뮤니티] Community
    // ==========================
    async createPost({ userId, title, content }) {
        const query = `INSERT INTO COMMUNITY (USER_ID, TITLE, CONTENT) VALUES (?, ?, ?)`;
        const [result] = await pool.query(query, [userId, title, content]);
        return result.insertId;
    },

    async findAllPosts() {
        // 작성자 닉네임을 포함하여 조회
        const query = `
            SELECT c.*, u.NAME as nickname 
            FROM COMMUNITY c
            LEFT JOIN USER u ON c.USER_ID = u.USER_ID
            ORDER BY c.REG_DATE DESC
        `;
        const [rows] = await pool.query(query);
        return rows;
    },

    async findPostById(postId) {
        const query = `SELECT * FROM COMMUNITY WHERE POST_ID = ?`;
        const [rows] = await pool.query(query, [postId]);
        return rows[0];
    },

    async updatePost({ postId, title, content }) {
        const query = `UPDATE COMMUNITY SET TITLE = ?, CONTENT = ? WHERE POST_ID = ?`;
        const [result] = await pool.query(query, [title, content, postId]);
        return result.affectedRows;
    },

    async deletePost(postId) {
        const query = `DELETE FROM COMMUNITY WHERE POST_ID = ?`;
        const [result] = await pool.query(query, [postId]);
        return result.affectedRows;
    },

    // [유틸] 사용자 권한(ROLE) 확인용
    async getUserRole(userId) {
        const query = `SELECT ROLE FROM USER WHERE USER_ID = ?`;
        const [rows] = await pool.query(query, [userId]);
        return rows.length > 0 ? rows[0].ROLE : null;
    }
};

module.exports = CommunityModel;