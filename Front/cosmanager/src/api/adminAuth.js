// src/api/adminAuth.js
import request from "./client.js";

/**
 * 관리자 로그인
 * @param {{ adminId: string, password: string }} payload
 * @returns {Promise<{ id: string | number, name: string, token: string }>}
 */
export async function adminLogin(payload) {
  // 백엔드 엔드포인트: POST /admin/auth/login
  return request("/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}