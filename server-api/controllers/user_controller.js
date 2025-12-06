const UserModel = require('../models/UserModel');

const userController = {
    // ... (기존 사용자용 함수들은 유지) ...

    // [관리자] 회원 목록 검색 및 조회
    getMembers: async (req, res) => {
        try {
            const { name } = req.query; // URL 쿼리 파라미터에서 이름 추출
            const members = await UserModel.findAllByName(name);

            res.status(200).json({
                result_code: 200,
                result_msg: "회원 목록 조회 성공",
                members: members
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 500,
                result_msg: "회원 목록 조회 중 오류 발생"
            });
        }
    },

    // [관리자] 회원 추가
    addMember: async (req, res) => {
        try {
            const { userId, email, password, name, gender, age } = req.body;
            
            // 필수값 간단 체크
            if (!userId || !email || !name) {
                return res.status(400).json({
                    result_code: 400,
                    result_msg: "필수 정보(ID, 이메일, 이름)가 누락되었습니다."
                });
            }

            await UserModel.create({ userId, email, password, name, gender, age });

            res.status(200).json({
                result_code: 200,
                result_msg: "회원 추가 성공"
            });
        } catch (error) {
            console.error(error);
            // 중복 ID/이메일 에러 처리 (MariaDB 에러코드 1062)
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    result_code: 102,
                    result_msg: "이미 존재하는 아이디 또는 이메일입니다."
                });
            }
            res.status(500).json({
                result_code: 500,
                result_msg: "회원 추가 실패"
            });
        }
    },

    // [관리자] 회원 정보 수정
    updateMember: async (req, res) => {
        try {
            const targetUserId = req.params.userId;
            const { name, email, gender, age, isActive } = req.body;

            const affectedRows = await UserModel.update({
                userId: targetUserId,
                name, email, gender, age, isActive
            });

            if (affectedRows === 0) {
                return res.status(404).json({
                    result_code: 404,
                    result_msg: "수정할 회원을 찾을 수 없습니다."
                });
            }

            res.status(200).json({
                result_code: 200,
                result_msg: "회원 정보 수정 성공"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 500,
                result_msg: "회원 수정 실패"
            });
        }
    },

    // [관리자] 회원 삭제
    deleteMember: async (req, res) => {
        try {
            const targetUserId = req.params.userId;

            const affectedRows = await UserModel.delete(targetUserId);

            if (affectedRows === 0) {
                return res.status(404).json({
                    result_code: 404,
                    result_msg: "삭제할 회원을 찾을 수 없습니다."
                });
            }

            res.status(200).json({
                result_code: 200,
                result_msg: "회원 삭제 성공"
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                result_code: 500,
                result_msg: "회원 삭제 실패"
            });
        }
    }
};

module.exports = userController;