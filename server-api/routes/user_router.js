const express = require('express');
const router = express.Router();
const userController = require('../controllers/user_controller');

// ... (기존 사용자용 라우트들 - 로그인, 회원가입 등) ...

// [관리자 기능] 회원 관리 API

// 회원 목록 검색 (이름)
// GET /api/users/admin/search?name=...
router.get('/admin/search', userController.getMembers);

// 회원 추가
// POST /api/users/admin
router.post('/admin', userController.addMember);

// 회원 정보 수정
// PUT /api/users/admin/:userId
router.put('/admin/:userId', userController.updateMember);

// 회원 삭제
// DELETE /api/users/admin/:userId
router.delete('/admin/:userId', userController.deleteMember);

module.exports = router;