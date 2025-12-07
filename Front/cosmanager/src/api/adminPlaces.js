// src/api/adminPlaces.js
import request from "./client.js";

/**
 * 관광지 등록
 * POST /api/admin/places
 * Body: { spotId, name, address, category, latitude, longitude }
 */
export async function createAdminPlace(payload) {
  return request("/api/admin/places", {
    method: "POST",
    auth: true,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

/**
 * 관광지 삭제
 * DELETE /api/admin/places/:id
 */
export async function deleteAdminPlace(id) {
  return request(`/api/admin/places/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

// TODO: 관리자용 관광지 목록 조회 API (GET /api/admin/places) 가 확정되면
// 여기에 fetchAdminPlaces 함수를 추가하고 화면에서 연동해야 합니다.
