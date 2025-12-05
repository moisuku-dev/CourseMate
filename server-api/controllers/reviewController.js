const ReviewModel = require('../models/ReviewModel');

const reviewController = {
    // 내 리뷰 수정
    updateReview: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            const { userId, rating, content, blogLink } = req.body; // userId는 토큰에서 추출하는 것이 정석이나, 현재 단계에선 Body로 받음

            // DB 업데이트 요청
            const affectedRows = await ReviewModel.update({
                reviewId, userId, rating, content, blogUrl: blogLink
            });

            if (affectedRows === 0) {
                return res.status(403).json({
                    result_code: 403,
                    result_msg: "리뷰 수정 권한이 없거나 존재하지 않는 리뷰입니다."
                });
            }

            res.status(200).json({
                result_code: 200,
                result_msg: "리뷰 수정 성공"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 202,
                result_msg: "리뷰 수정 실패 (DB 오류)"
            });
        }
    },

    // 내 리뷰 삭제
    deleteReview: async (req, res) => {
        try {
            const reviewId = req.params.reviewId;
            // 삭제 요청 시 본인 확인을 위해 userId가 필요함 (Body 혹은 Header)
            const { userId } = req.body; 

            const affectedRows = await ReviewModel.delete({ reviewId, userId });

            if (affectedRows === 0) {
                return res.status(403).json({
                    result_code: 403,
                    result_msg: "리뷰 삭제 권한이 없거나 존재하지 않는 리뷰입니다."
                });
            }

            res.status(200).json({
                result_code: 200,
                result_msg: "리뷰 삭제 성공"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 202,
                result_msg: "리뷰 삭제 실패 (DB 오류)"
            });
        }
    }
};

module.exports = reviewController;