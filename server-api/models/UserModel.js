const pool = require('../config/db_config');

const UserModel = {
    // ... (기존 로그인/회원가입 관련 함수들은 유지) ...

    // [관리자] 회원 목록 조회 (이름 검색 포함)
    async findAllByName(name) {
        let query = `
            SELECT USER_ID, EMAIL, NAME, GENDER, AGE, JOIN_DATE, IS_ACTIVE
            FROM USER
            WHERE 1=1
        `;
        let params = [];

        if (name) {
            query += ` AND NAME LIKE ?`;
            params.push(`%${name}%`);
        }

        query += ` ORDER BY JOIN_DATE DESC`; // 최신 가입순 정렬

        const [rows] = await pool.query(query, params);
        return rows;
    },

    // [관리자] 회원 직접 추가
    async create(userInfo) {
        const { userId, email, password, name, gender, age } = userInfo;
        const query = `
            INSERT INTO USER (USER_ID, EMAIL, PASSWORD, NAME, GENDER, AGE, IS_ACTIVE)
            VALUES (?, ?, ?, ?, ?, ?, 'Y')
        `;
        // 비밀번호는 실제 서비스에선 암호화(bcrypt 등)가 필요하지만, 
        // 현재 단계에서는 입력받은 그대로 저장하거나 임시 처리를 가정합니다.
        const [result] = await pool.query(query, [userId, email, password, name, gender, age]);
        return result.insertId;
    },

    // [관리자] 회원 정보 수정
    async update(userInfo) {
        const { userId, name, email, gender, age, isActive } = userInfo;
        const query = `
            UPDATE USER
            SET NAME = ?, EMAIL = ?, GENDER = ?, AGE = ?, IS_ACTIVE = ?
            WHERE USER_ID = ?
        `;
        const [result] = await pool.query(query, [name, email, gender, age, isActive, userId]);
        return result.affectedRows;
    },

    // [관리자] 4. 회원 삭제
    async delete(userId) {
        const query = `DELETE FROM USER WHERE USER_ID = ?`;
        const [result] = await pool.query(query, [userId]);
        return result.affectedRows;
    }
};

module.exports = UserModel;