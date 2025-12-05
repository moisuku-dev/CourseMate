const express = require('express');
const router = express.Router();
const placeController = require('../controllers/placeController');

// 1. 여행지 검색 및 목록 조회 (주요 여행지 선택 포함)
router.get('/', placeController.getPlaces);

// 2. 여행지 상세 조회
router.get('/:id', placeController.getPlaceDetail);

// 3. 특정 관광지 리뷰 조회 (블로그 링크 포함)
// GET /api/places/{id}/reviews
router.get('/:id/reviews', placeController.getPlaceReviews);

// 4. 특정 관광지 사진 조회
// GET /api/places/{id}/photos
router.get('/:id/photos', placeController.getPlacePhotos);
router.post('/:id/reviews', placeController.createReview);

module.exports = router;