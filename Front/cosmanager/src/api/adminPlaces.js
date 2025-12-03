// src/api/adminPlaces.js
import request from "./client.js";

/**
 * 관광지 목록 조회
 * @param {{ keyword?: string, area?: string, page?: number, size?: number }} params
 * 응답 예시:
 * [
 *   {
 *     id, name, category, area, address,
 *     rating, reviewCount, isVisible
 *   }, ...
 * ]
 */
export async function fetchPlaces(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.set("keyword", params.keyword);
  if (params.area) searchParams.set("area", params.area);
  if (params.page != null) searchParams.set("page", String(params.page));
  if (params.size != null) searchParams.set("size", String(params.size));

  const qs = searchParams.toString();
  const path = `/admin/places${qs ? `?${qs}` : ""}`;

  return request(path, {
    method: "GET",
    auth: true,
  });
}

/**
 * 관광지 등록
 * @param {object} payload - { name, category, area, address, tags, ... }
 */
export async function createPlace(payload) {
  return request("/admin/places", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * 관광지 수정
 * @param {number|string} placeId
 * @param {object} payload
 */
export async function updatePlace(placeId, payload) {
  return request(`/admin/places/${placeId}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(payload),
  });
}

/**
 * 관광지 삭제
 * @param {number|string} placeId
 */
export async function deletePlace(placeId) {
  return request(`/admin/places/${placeId}`, {
    method: "DELETE",
    auth: true,
  });
}

/**
 * 관광지 노출 여부 변경
 * @param {number|string} placeId
 * @param {boolean} visible
 */
export async function updatePlaceVisibility(placeId, visible) {
  return request(`/admin/places/${placeId}/visibility`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify({ visible }),
  });
}
