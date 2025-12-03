// src/pages/AdminDashboardPage.jsx
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchDashboardStats } from "../api/adminDashboard.js";

const AdminDashboardPage = () => {
  const { admin, logout } = useAuth();

  const [stats, setStats] = useState(null); // { todayUsers, todayReviews, totalUsers, totalReviews }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
      setError("통계 정보를 불러오지 못했습니다.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "24px" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h1 style={{ fontSize: "20px", margin: 0 }}>대시보드</h1>
            <div style={{ fontSize: "12px", color: "#aaa", marginTop: "4px" }}>
              관리자 통계 현황
            </div>
          </div>
          <div style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>{admin?.name}님</span>
            <button
              type="button"
              onClick={logout}
              style={{
                padding: "6px 10px",
                borderRadius: "6px",
                border: "1px solid #444",
                backgroundColor: "#111",
                fontSize: "12px",
              }}
            >
              로그아웃
            </button>
          </div>
        </header>

        <section style={{ marginBottom: "16px" }}>
          <button
            type="button"
            onClick={loadStats}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #444",
              fontSize: "12px",
              backgroundColor: "#111",
            }}
          >
            새로고침
          </button>
        </section>

        {loading && <div style={{ fontSize: "13px" }}>불러오는 중...</div>}
        {error && (
          <div style={{ fontSize: "13px", color: "#ff6b6b", marginBottom: "8px" }}>
            {error}
          </div>
        )}

        <section
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            marginTop: "8px",
          }}
        >
          <div
            style={{
              flex: "0 0 220px",
              borderRadius: "10px",
              border: "1px solid #333",
              padding: "12px",
              backgroundColor: "#111",
            }}
          >
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>오늘 가입한 회원 수</div>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {stats?.todayUsers ?? "-"}
            </div>
          </div>
          <div
            style={{
              flex: "0 0 220px",
              borderRadius: "10px",
              border: "1px solid #333",
              padding: "12px",
              backgroundColor: "#111",
            }}
          >
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>오늘 등록된 리뷰 수</div>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {stats?.todayReviews ?? "-"}
            </div>
          </div>
          <div
            style={{
              flex: "0 0 220px",
              borderRadius: "10px",
              border: "1px solid #333",
              padding: "12px",
              backgroundColor: "#111",
            }}
          >
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>전체 회원 수</div>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {stats?.totalUsers ?? "-"}
            </div>
          </div>
          <div
            style={{
              flex: "0 0 220px",
              borderRadius: "10px",
              border: "1px solid #333",
              padding: "12px",
              backgroundColor: "#111",
            }}
          >
            <div style={{ fontSize: "13px", marginBottom: "4px" }}>전체 리뷰 수</div>
            <div style={{ fontSize: "22px", fontWeight: "700" }}>
              {stats?.totalReviews ?? "-"}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
