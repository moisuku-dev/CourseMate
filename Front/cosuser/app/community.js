// src/api/community.js
import request from "../api/client";

/** 공지사항 목록: GET /api/community/notices */
export async function fetchNotices() {
  return request("/community/notices");
}

/** 공지사항 상세: GET /api/community/notices/{id} */
export async function fetchNoticeDetail(id) {
  return request(`/community/notices/${id}`);
}

/** 불편사항/문의 등록: POST /api/community/feedback */
export async function sendFeedback({ title, content }) {
  return request("/community/feedback", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
}

/** 내 문의 내역 조회: GET /api/community/feedback/me */
export async function fetchMyFeedbacks() {
  return request("/community/feedback/me");
}
