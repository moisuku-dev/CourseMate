const express = require('express');
const router = express.Router();
const communityController = require('../controllers/communityController');

// ==========================
// 1. 공지사항 (Notice)
// ==========================
// 목록 조회 (누구나)
router.get('/notices', communityController.getNotices);

// 등록 (관리자)
router.post('/notices', communityController.addNotice);

// 수정 (관리자)
router.put('/notices/:noticeId', communityController.updateNotice);

// 삭제 (관리자)
router.delete('/notices/:noticeId', communityController.deleteNotice);


// ==========================
// 2. 커뮤니티 의견 (Community)
// ==========================
// 목록 조회
router.get('/posts', communityController.getPosts);

// 글 쓰기
router.post('/posts', communityController.addPost);

// 글 수정 (본인만)
router.put('/posts/:postId', communityController.updatePost);

// 글 삭제 (본인 또는 관리자)
router.delete('/posts/:postId', communityController.deletePost);

module.exports = router;