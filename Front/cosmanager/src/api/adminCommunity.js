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
    body: JSON.stringify(payload),
  });
}

/**
 * 공지사항 수정
 * @param {number|string} noticeId
 * @param {object} payload
 */
export async function updateNotice(noticeId, payload) {
  return request(`/admin/notices/${noticeId}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * 공지사항 삭제
 * @param {number|string} noticeId
 */
export async function deleteNotice(noticeId) {
  return request(`/admin/notices/${noticeId}`, {
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
 * 의견 상태 변경
 * @param {number|string} feedbackId
 * @param {string} status
 */
export async function updateFeedbackStatus(feedbackId, status) {
  return request(`/admin/feedbacks/${feedbackId}/status`, {
    method: "PATCH",
    auth: true,
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
