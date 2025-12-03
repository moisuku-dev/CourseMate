// src/api/adminReviews.js
import request from "./client.js";

/**
 * 리뷰 목록 조회
 * @param {{ keyword?: string, placeId?: string|number, page?: number, size?: number }} params
 * 응답 예시:
 * [
 *   {
 *     id, placeName, userNickname, rating,
 *     content, createdAt, visible
 *   }, ...
 * ]
 */
export async function fetchReviews(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.placeId != null) searchParams.set("placeId", String(params.placeId));
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.size != null) searchParams.set("size", String(params.size));

  const qs = searchParams.toString();
  const path = `/admin/reviews${qs ? `?${qs}` : ""}`;

  return request(path, {
    method: "GET",
    auth: true,
  });
}

/**
 * 리뷰 노출/비노출 변경
 * @param {number|string} reviewId
 * @param {boolean} visible
 */
export async function updateReviewVisibility(reviewId, visible) {
  return request(`/admin/reviews/${reviewId}/visibility`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ visible }),
  });
}

/**
 * 리뷰 삭제
 * @param {number|string} reviewId
 */
export async function deleteReview(reviewId) {
  return request(`/admin/reviews/${reviewId}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * 태그 목록 조회
 * 응답 예시:
 * [
 *   { id, name, description, isActive }
 * ]
 */
export async function fetchTags() {
  return request("/admin/tags", {
    method: "GET",
    auth: true,
  });
}

/**
 * 태그 생성
 * @param {{ name: string, description?: string }} payload
 */
export async function createTag(payload) {
  return request("/admin/tags", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * 태그 수정
 * @param {number|string} tagId
 * @param {object} payload
 */
export async function updateTag(tagId, payload) {
  return request(`/admin/tags/${tagId}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * 태그 삭제
 * @param {number|string} tagId
 */
export async function deleteTag(tagId) {
  return request(`/admin/tags/${tagId}`, {
    method: "DELETE",
    auth: true,
  });
}
