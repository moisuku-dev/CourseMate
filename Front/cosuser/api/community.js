// api/community.js
import request from "./client";

export async function fetchNotices() {
  return request("/community/notices");
}

export async function fetchNoticeDetail(id) {
  return request(`/community/notices/${id}`);
}

export async function createFeedback({ title, content }) {
  return request("/community/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content }),
  });
}

export async function fetchMyFeedbacks() {
  return request("/community/feedback/me");
}
