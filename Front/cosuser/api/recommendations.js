// api/recommendations.js
import request from "./client";

/**
 * AI 맞춤 관광 코스 추천: GET /api/recommendations
 */
export async function fetchRecommendations() {
  return request("/recommendations");
}

/**
 * 다른 관광 코스 선택(재추천): GET /api/recommendations/retry
 */
export async function retryRecommendations() {
  return request("/recommendations/retry");
}
