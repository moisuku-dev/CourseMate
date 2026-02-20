const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// CSV 태그 데이터 가져오기 (1회성 실행 또는 주기적 갱신)
// POST /api/admin/tags/import
router.post('/tags/import', adminController.importTopTags);

// 리뷰 관리
router.get('/reviews', adminController.getAllReviews);          // 전체 리뷰 조회
router.post('/reviews', adminController.addAdminReview);        // 리뷰 수동 추가
router.delete('/reviews/:reviewId', adminController.deleteReview); // 리뷰 삭제

// 태그 관리 (수동)
router.post('/tags', adminController.addOrUpdateTag);           // 태그 추가/수정
router.delete('/tags/:spotId/:tagId', adminController.deleteTag); // 태그 삭제

module.exports = router;