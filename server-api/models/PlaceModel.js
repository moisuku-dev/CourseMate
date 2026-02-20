const pool = require('../config/db_config');

const PlaceModel = {
    // 여행지 목록 조회
    // 주요 여행지 선택: 별점순/리뷰순 정렬하여 상위 노출
    async findAll({ keyword, category, page, size }) {
        let query = `SELECT SPOT_ID, NAME, ADDRESS, CATEGORY, AVG_RATING, REVIEW_COUNT, IMG_URL 
                     FROM TOUR_SPOT WHERE 1=1`;
        let params = [];

        // 검색어 필터 (여행지 검색)
        if (keyword) {
            query += ` AND NAME LIKE ?`;
            params.push(`%${keyword}%`);
        }

        // 카테고리 필터
        if (category) {
            query += ` AND CATEGORY = ?`;
            params.push(category);
        }

        // 전체 카운트 조회 (페이지네이션용)
        const countQuery = `SELECT COUNT(*) as totalCount FROM (${query}) as sub`;
        const [countRows] = await pool.query(countQuery, params);
        const totalCount = countRows[0].totalCount;

        // 정렬 및 페이징 (주요 여행지 위주 노출을 위해 평점/리뷰순 정렬 권장)
        query += ` ORDER BY AVG_RATING DESC, REVIEW_COUNT DESC LIMIT ? OFFSET ?`;
        const limit = parseInt(size);
        const offset = (parseInt(page) - 1) * limit;
        params.push(limit, offset);

        const [rows] = await pool.query(query, params);
        return { totalCount, places: rows };
    },

    // 여행지 상세 정보 조회
    async findById(spotId) {
        // AI 분석 특성 태그(SPOT_FEATURE)와 조인하여 가져오는 쿼리 예시
        // 실제로는 태그 테이블과 조인하거나 별도 조회 후 병합 필요
        const query = `
            SELECT * FROM TOUR_SPOT WHERE SPOT_ID = ?
        `;
        const [rows] = await pool.query(query, [spotId]);
        return rows[0];
    },

    async findReviews(spotId) {
        // USER 테이블과 조인하여 닉네임(NAME)을 가져옵니다.
        const query = `
            SELECT r.REVIEW_ID, r.RATING, r.CONTENT, r.SENTIMENT, r.REG_DATE, r.BLOG_URL,
                   u.NAME as nickname
            FROM REVIEW r
            LEFT JOIN USER u ON r.USER_ID = u.USER_ID
            WHERE r.SPOT_ID = ?
            ORDER BY r.REG_DATE DESC
        `;
        const [rows] = await pool.query(query, [spotId]);
        return rows;
    },

    // 특정 관광지의 사진 목록 조회
    async findPhotos(spotId) {
        const query = `
            SELECT PHOTO_ID, IMG_URL, REG_DATE
            FROM PHOTO
            WHERE SPOT_ID = ?
            ORDER BY REG_DATE DESC
        `;
        const [rows] = await pool.query(query, [spotId]);
        return rows;
    }

};

module.exports = PlaceModel;