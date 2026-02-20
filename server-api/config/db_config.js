// server-api/config/db_config.js
const mysql = require('mysql2/promise');

// 설계서 10.1 개발환경 - 서버 DB 규격 참고
const pool = mysql.createPool({
    host: 'localhost',      // 실제 DB IP (설계서: IP주소)
    user: 'root',           // DB 계정
    password: 'password',   // DB 비밀번호
    database: 'coursemate', // DB 이름
    port: 3306,             // TCP Port
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;