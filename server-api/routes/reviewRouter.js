const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// 1. 내 리뷰 수정
router.put('/:reviewId', reviewController.updateReview);

// 2. 내 리뷰 삭제
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;