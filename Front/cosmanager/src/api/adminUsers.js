// src/api/adminUsers.js
import request from "./client.js";

/**
 * 회원 목록 조회
 */
export async function fetchUsers(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.size != null) searchParams.set("size", String(params.size));

  const qs = searchParams.toString();
  const path = `/admin/users${qs ? `?${qs}` : ""}`;

  return request(path, {
    method: "GET",
    auth: true,
  });
}

/**
 * 회원 상태(활성/비활성 등) 변경
 */
export async function updateUserStatus(userId, status) {
  return request(`/admin/users/${userId}/status`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ status }),
  });
}

/**
 * 회원 정보 수정
 */
export async function updateUser(userId, payload) {
  return request(`/admin/users/${userId}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * 회원 삭제
 */
export async function deleteUser(userId) {
  return request(`/admin/users/${userId}`, {
    method: "DELETE",
    auth: true,
  });
}