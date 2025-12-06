const PlaceModel = require('../models/PlaceModel');
const ReviewModel = require('../models/ReviewModel');

const placeController = {
    // 관광지 목록 조회/검색
    getPlaces: async (req, res) => {
        try {
            // 쿼리 파라미터 파싱 (기본값 설정)
            const { keyword, category, page = 1, size = 10 } = req.query;

            const result = await PlaceModel.findAll({ keyword, category, page, size });

            // API 응답 형식 준수
            res.status(200).json({
                result_code: 200,
                result_msg: "관광지 목록 조회 성공",
                totalCount: result.totalCount,
                places: result.places.map(place => ({
                    spotId: place.SPOT_ID,
                    name: place.NAME,
                    address: place.ADDRESS, // 목록 조회 시 주소 등 필요 정보 추가
                    avgRating: place.AVG_RATING,
                    reviewCount: place.REVIEW_COUNT,
                    imgUrl: place.IMG_URL // 썸네일 표시용
                }))
            });

        } catch (error) {
            console.error(error);
            // 오류코드 참조 (201: DB 데이터 조회 실패 등)
            res.status(500).json({
                result_code: 201,
                result_msg: "DB 데이터 조회 실패"
            });
        }
    },

    // 관광지 상세 정보 조회
    getPlaceDetail: async (req, res) => {
        try {
            const spotId = req.params.id;
            const place = await PlaceModel.findById(spotId);

            if (!place) {
                return res.status(404).json({
                    result_code: 201,
                    result_msg: "해당 관광지를 찾을 수 없습니다."
                });
            }

            // 설계서 응답 형식 매핑
            res.status(200).json({
                result_code: 200,
                result_msg: "관광지 상세 정보 조회 성공",
                place: {
                    spotId: place.SPOT_ID,
                    name: place.NAME,
                    address: place.ADDRESS,
                    category: place.CATEGORY,
                    avgRating: place.AVG_RATING,
                    // features: // 추후 AI 태그 연동 시 추가 구현
                }
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 201,
                result_msg: "DB 데이터 조회 실패"
            });
        }
    },

    // 특정 관광지 리뷰 목록 조회
    getPlaceReviews: async (req, res) => {
        try {
            const spotId = req.params.id;
            const reviews = await PlaceModel.findReviews(spotId);

            res.status(200).json({
                result_code: 200,
                result_msg: "리뷰 목록 조회 성공",
                reviews: reviews.map(review => ({
                    reviewId: review.REVIEW_ID,
                    nickname: review.nickname || "익명", // 닉네임 없을 시 기본값
                    rating: review.RATING,
                    content: review.CONTENT,
                    sentiment: review.SENTIMENT,
                    blogLink: review.BLOG_URL, // 요구사항: 참고 블로그 표시
                    regDate: review.REG_DATE
                }))
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 500,
                result_msg: "리뷰 조회 중 오류가 발생했습니다."
            });
        }
    },

    // 여행 후기(리뷰/별점) 작성
    createReview: async (req, res) => {
        try {
            const spotId = req.params.id;
            const { userId, rating, content, blogLink } = req.body;

            // 필수 파라미터 체크 (설계서 오류코드 401)
            if (!userId || !rating || !content) {
                return res.status(400).json({
                    result_code: 401,
                    result_msg: "필수 요청 파라미터 누락"
                });
            }

            const newReviewId = await ReviewModel.create({
                userId, spotId, rating, content, blogUrl: blogLink
            });

            res.status(200).json({
                result_code: 200,
                result_msg: "리뷰 및 별점 작성 성공. AI 분석이 곧 진행됩니다.",
                reviewId: newReviewId
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 202,
                result_msg: "리뷰 저장 실패"
            });
        }
    },

    // 특정 관광지 사진 목록 조회
    getPlacePhotos: async (req, res) => {
        try {
            const spotId = req.params.id;
            const photos = await PlaceModel.findPhotos(spotId);

            res.status(200).json({
                result_code: 200,
                result_msg: "사진 목록 조회 성공",
                photos: photos.map(photo => ({
                    photoId: photo.PHOTO_ID,
                    url: photo.IMG_URL,
                    regDate: photo.REG_DATE
                }))
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 500,
                result_msg: "사진 조회 중 오류가 발생했습니다."
            });
        }
    }
};

module.exports = placeController;