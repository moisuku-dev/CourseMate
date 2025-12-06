const CommunityModel = require('../models/CommunityModel');

const communityController = {
    // ==========================
    // [공지사항] 관리자만 가능
    // ==========================
    getNotices: async (req, res) => {
        try {
            const notices = await CommunityModel.findAllNotices();
            res.status(200).json({ result_code: 200, notices });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "공지사항 조회 실패" });
        }
    },

    addNotice: async (req, res) => {
        try {
            const { userId, title, content } = req.body;
            
            // 권한 체크
            const role = await CommunityModel.getUserRole(userId);
            if (role !== 'ADMIN') {
                return res.status(403).json({ result_code: 403, result_msg: "관리자만 공지사항을 등록할 수 있습니다." });
            }

            await CommunityModel.createNotice({ userId, title, content });
            res.status(200).json({ result_code: 200, result_msg: "공지사항 등록 성공" });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "공지사항 등록 실패" });
        }
    },

    updateNotice: async (req, res) => {
        try {
            const { noticeId } = req.params;
            const { userId, title, content } = req.body;

            const role = await CommunityModel.getUserRole(userId);
            if (role !== 'ADMIN') {
                return res.status(403).json({ result_code: 403, result_msg: "권한이 없습니다." });
            }

            await CommunityModel.updateNotice({ noticeId, title, content });
            res.status(200).json({ result_code: 200, result_msg: "공지사항 수정 성공" });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "공지사항 수정 실패" });
        }
    },

    deleteNotice: async (req, res) => {
        try {
            const { noticeId } = req.params;
            const { userId } = req.body; // 삭제 요청자

            const role = await CommunityModel.getUserRole(userId);
            if (role !== 'ADMIN') {
                return res.status(403).json({ result_code: 403, result_msg: "권한이 없습니다." });
            }

            await CommunityModel.deleteNotice(noticeId);
            res.status(200).json({ result_code: 200, result_msg: "공지사항 삭제 성공" });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "공지사항 삭제 실패" });
        }
    },

    // ==========================
    // [커뮤니티] 누구나 작성, 본인/관리자 삭제
    // ==========================
    getPosts: async (req, res) => {
        try {
            const posts = await CommunityModel.findAllPosts();
            res.status(200).json({ result_code: 200, posts });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "게시글 조회 실패" });
        }
    },

    addPost: async (req, res) => {
        try {
            const { userId, title, content } = req.body;
            if (!userId || !title || !content) {
                return res.status(400).json({ result_code: 400, result_msg: "필수 정보 누락" });
            }
            await CommunityModel.createPost({ userId, title, content });
            res.status(200).json({ result_code: 200, result_msg: "게시글 등록 성공" });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "게시글 등록 실패" });
        }
    },

    updatePost: async (req, res) => {
        try {
            const { postId } = req.params;
            const { userId, title, content } = req.body;

            // 게시글 존재 확인
            const post = await CommunityModel.findPostById(postId);
            if (!post) return res.status(404).json({ result_code: 404, result_msg: "게시글이 없습니다." });

            // 본인 확인 (커뮤니티 글은 본인만 수정 가능)
            if (post.USER_ID !== userId) {
                return res.status(403).json({ result_code: 403, result_msg: "수정 권한이 없습니다." });
            }

            await CommunityModel.updatePost({ postId, title, content });
            res.status(200).json({ result_code: 200, result_msg: "게시글 수정 성공" });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "게시글 수정 실패" });
        }
    },

    deletePost: async (req, res) => {
        try {
            const { postId } = req.params;
            const { userId } = req.body; // 삭제 요청자 ID

            const post = await CommunityModel.findPostById(postId);
            if (!post) return res.status(404).json({ result_code: 404, result_msg: "게시글이 없습니다." });

            const requestorRole = await CommunityModel.getUserRole(userId);

            // 삭제 권한: 본인 OR 관리자('ADMIN')
            if (post.USER_ID !== userId && requestorRole !== 'ADMIN') {
                return res.status(403).json({ result_code: 403, result_msg: "삭제 권한이 없습니다." });
            }

            await CommunityModel.deletePost(postId);
            res.status(200).json({ result_code: 200, result_msg: "게시글 삭제 성공" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ result_code: 500, result_msg: "게시글 삭제 실패" });
        }
    }
};

module.exports = communityController;