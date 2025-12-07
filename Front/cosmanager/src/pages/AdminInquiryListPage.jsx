// src/pages/AdminInquiryListPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";

const AdminInquiryListPage = () => {
  const navigate = useNavigate();

  // TODO: 문의 목록 조회 API 연동 필요
  // GET /api/admin/inquiries (백엔드 스펙 확정 시)

  const handleFakeClick = () => {
    // 데모용 이동 (실제에선 목록에서 id 를 받아서 이동)
    navigate("/admin/inquiries/1");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#020617" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "24px 28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f9fafb", marginBottom: "4px" }}>
          문의 관리
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
          사용자가 남긴 문의/불편사항을 조회하고, 상세 내용을 확인한 뒤 답변을 등록할 수
          있습니다.
        </p>

        <div
          style={{
            backgroundColor: "#020617",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.65)",
            fontSize: "13px",
            color: "#9ca3af",
          }}
        >
          <p style={{ marginBottom: "8px" }}>
            현재 관리자용 문의 목록 조회 API 정보가 없어, 이 화면은 UI만 구성된 상태입니다.
          </p>
          <p>
            백엔드에서 API가 준비되면 목록/검색/페이징 기능을 이 영역에 연동할 수 있습니다.
          </p>

          <button
            type="button"
            onClick={handleFakeClick}
            style={{
              marginTop: "16px",
              padding: "8px 12px",
              borderRadius: "9999px",
              border: "1px solid rgba(148,163,184,0.8)",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            예시 문의 상세 화면으로 이동
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminInquiryListPage;
