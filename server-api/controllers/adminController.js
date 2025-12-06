// server-api/controllers/adminController.js
const fs = require('fs');
const path = require('path');
const ReviewModel = require('../models/ReviewModel');
const TagModel = require('../models/TagModel');

const adminController = {
    // ==========================================
    // [기능 1] CSV 파일로 1, 2등 태그 일괄 등록
    // ==========================================
    importTopTags: async (req, res) => {
        try {
            // 파일 경로: server-api/data/top2_tags_summary.csv 라고 가정
            // (실제 파일 위치에 맞게 경로를 수정하세요)
            const csvPath = path.join(__dirname, '../data/top2_tags_summary.csv'); 

            if (!fs.existsSync(csvPath)) {
                return res.status(404).json({ result_code: 404, result_msg: "CSV 파일을 찾을 수 없습니다." });
            }

            const data = fs.readFileSync(csvPath, 'utf8');
            const lines = data.split('\n'); // 줄바꿈으로 분리

            let successCount = 0;
            let failCount = 0;

            // 헤더(첫 줄) 제외하고 반복
            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                // CSV 구조: store_name, 1st_tag, 1st_score, 2nd_tag, 2nd_score
                const cols = line.split(','); 
                if (cols.length < 5) continue;

                const spotName = cols[0].trim();
                const tag1Name = cols[1].trim();
                const tag1Score = parseFloat(cols[2].trim()) || 0;
                const tag2Name = cols[3].trim();
                const tag2Score = parseFloat(cols[4].trim()) || 0;

                // 1. 관광지 ID 찾기
                const spotId = await TagModel.findSpotIdByName(spotName);
                if (!spotId) {
                    failCount++;
                    continue; 
                }

                // 2. 1등 태그 처리
                if (tag1Name) {
                    const tag1Id = await TagModel.getOrInsertTagId(tag1Name);
                    await TagModel.insertOrUpdateSpotFeature(spotId, tag1Id, tag1Score);
                }

                // 3. 2등 태그 처리
                if (tag2Name) {
                    const tag2Id = await TagModel.getOrInsertTagId(tag2Name);
                    await TagModel.insertOrUpdateSpotFeature(spotId, tag2Id, tag2Score);
                }

                successCount++;
            }

            res.status(200).json({
                result_code: 200,
                result_msg: "태그 데이터 가져오기 완료",
                details: { success: successCount, failed: failCount }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ result_code: 500, result_msg: "CSV 가져오기 실패" });
        }
    },

    // ==========================================
    // [기능 2] 리뷰 관리 (조회/삭제)
    // ==========================================
    getAllReviews: async (req, res) => {
        try {
            const reviews = await ReviewModel.findAll();
            res.status(200).json({ result_code: 200, reviews });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "리뷰 조회 실패" });
        }
    },

    deleteReview: async (req, res) => {
        try {
            const { reviewId } = req.params;
            await ReviewModel.deleteByAdmin(reviewId);
            res.status(200).json({ result_code: 200, result_msg: "리뷰 삭제 성공" });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "리뷰 삭제 실패" });
        }
    },
    
    // [관리자] 리뷰 수동 추가 (테스트용 등)
    addAdminReview: async (req, res) => {
        try {
            // body: { userId, spotId, rating, content, blogLink }
            const newId = await ReviewModel.create(req.body);
            res.status(200).json({ result_code: 200, result_msg: "리뷰 등록 성공", reviewId: newId });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "리뷰 등록 실패" });
        }
    },

    // ==========================================
    // [기능 3] 태그 관리 (수동 추가/수정/삭제)
    // ==========================================
    // 특정 관광지에 태그 추가/수정
    addOrUpdateTag: async (req, res) => {
        try {
            const { spotId, tagName, score } = req.body;
            const tagId = await TagModel.getOrInsertTagId(tagName);
            await TagModel.insertOrUpdateSpotFeature(spotId, tagId, score);
            
            res.status(200).json({ result_code: 200, result_msg: "태그 반영 성공" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ result_code: 500, result_msg: "태그 반영 실패" });
        }
    },

    // 특정 관광지의 특정 태그 삭제
    deleteTag: async (req, res) => {
        try {
            const { spotId, tagId } = req.params; // URL 파라미터로 받음
            await TagModel.deleteSpotFeature(spotId, tagId);
            res.status(200).json({ result_code: 200, result_msg: "태그 삭제 성공" });
        } catch (error) {
            res.status(500).json({ result_code: 500, result_msg: "태그 삭제 실패" });
        }
    }
};

module.exports = adminController;