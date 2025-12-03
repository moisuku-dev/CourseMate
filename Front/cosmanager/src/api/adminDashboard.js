// src/api/adminDashboard.js
import request from "./client.js";

/**
 * 대시보드 통계 조회
 */
export async function fetchDashboardStats() {
  // 예: GET /admin/dashboard/stats
  return request("/admin/dashboard/stats", {
    method: "GET",
    auth: true,
  });
}