/*
// src/api/adminCommunity.js
import request from "./client.js";


export async function answerInquiry(inquiryId, payload) {
  return request(`/api/admin/inquiries/${inquiryId}/answer`, {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// TODO:
//  - 문의 목록 조회: GET /api/admin/inquiries
//  - 문의 상세 조회: GET /api/admin/inquiries/:id
// 가 백엔드에 추가되면, 위 스펙에 맞는 함수를 여기에 정의하고
// AdminInquiryListPage / AdminInquiryDetailPage 에서 연동해야 합니다.
*/

// src/api/adminCommunity.js
import request from "./client.js";

/**
 * 공지사항 목록 조회
 * 응답 예시:
 * [
 *   { id, title, content, createdAt, updatedAt, pinned }
 * ]
 */
export async function fetchNotices() {
  return request("/admin/notices", {
    method: "GET",
    auth: true,
  });
}

/**
 * 공지사항 생성
 * @param {{ title: string, content: string, pinned?: boolean }} payload
 */
export async function createNotice(payload) {
  return request("/admin/notices", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * 공지사항 수정
 * @param {number|string} id
 * @param {{ title: string, content: string, pinned?: boolean }} payload
 */
export async function updateNotice(id, payload) {
  return request(`/admin/notices/${id}`, {
    method: "PUT",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * 공지사항 삭제
 * @param {number|string} id
 */
export async function deleteNotice(id) {
  return request(`/admin/notices/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * 이용자 의견 목록 조회
 * 응답 예시:
 * [
 *   { id, userNickname, title, content, createdAt, status }
 * ]
 */
export async function fetchFeedbacks() {
  return request("/admin/feedbacks", {
    method: "GET",
    auth: true,
  });
}

/**
 * 의견 상태 변경 (예: 처리중/완료 등)
 * @param {number|string} feedbackId
 * @param {string} status
 */
export async function updateFeedbackStatus(feedbackId, status) {
  return request(`/admin/feedbacks/${feedbackId}/status`, {
    method: "PUT",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });
}

/**
 * 의견 삭제
 * @param {number|string} feedbackId
 */
export async function deleteFeedback(feedbackId) {
  return request(`/admin/feedbacks/${feedbackId}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * 문의 답변 등록
 * 실제 백엔드 엔드포인트 예시:
 * POST /api/admin/inquiries/:id/answer
 * Body: { answerContent }
 */
export async function answerInquiry(inquiryId, payload) {
  return request(`/api/admin/inquiries/${inquiryId}/answer`, {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

// TODO:
//  - 문의 목록 조회: GET /api/admin/inquiries
//  - 문의 상세 조회: GET /api/admin/inquiries/:id
// 가 백엔드에 추가되면, 위 스펙에 맞는 함수를 여기에 정의하고
// AdminInquiryListPage / AdminInquiryDetailPage 에서 연동해야 합니다.
