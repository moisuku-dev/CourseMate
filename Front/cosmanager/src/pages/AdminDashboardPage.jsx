// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { fetchDashboardStats } from "../api/adminDashboard.js";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null); // { totalUsers, totalReviews, totalSpots }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchDashboardStats();
      if (res && res.result_code === 200) {
        setStats(res.stats || null);
      } else {
        setError(res?.result_msg || "통계 조회에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      setError("통계 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#020617" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "24px 28px", backgroundColor: "#020617" }}>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#f9fafb",
            marginBottom: "4px",
          }}
        >
          대시보드
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
          코스메이트 서비스의 전체 현황을 한눈에 확인합니다.
        </p>

        {loading && (
          <div style={{ color: "#e5e7eb", fontSize: "14px" }}>
            통계를 불러오는 중입니다...
          </div>
        )}
        {error && (
          <div style={{ color: "#fecaca", fontSize: "13px", marginBottom: "8px" }}>
            {error}
          </div>
        )}

        {stats && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            <StatCard label="전체 회원 수" value={stats.totalUsers} />
            <StatCard label="전체 리뷰 수" value={stats.totalReviews} />
            <StatCard label="등록된 관광지 수" value={stats.totalSpots} />
          </section>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ label, value }) => {
  return (
    <div
      style={{
        backgroundColor: "#020617",
        borderRadius: "14px",
        padding: "16px 18px",
        border: "1px solid rgba(148,163,184,0.35)",
        boxShadow: "0 8px 24px rgba(15,23,42,0.65)",
      }}
    >
      <div style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "6px" }}>
        {label}
      </div>
      <div style={{ fontSize: "22px", fontWeight: "700", color: "#f9fafb" }}>
        {value ?? "-"}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
