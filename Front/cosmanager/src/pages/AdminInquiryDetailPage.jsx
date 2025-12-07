// src/pages/AdminInquiryDetailPage.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { answerInquiry } from "../api/adminCommunity.js";

const AdminInquiryDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [answer, setAnswer] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // TODO: 문의 상세 조회 API 연동 필요
  // GET /api/admin/inquiries/:id (백엔드 구현 후)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!answer.trim()) {
      setMessage("답변 내용을 입력해주세요.");
      return;
    }
    setSaving(true);
    try {
      const res = await answerInquiry(id, { answerContent: answer });
      if (res && res.result_code === 200) {
        setMessage("답변 등록에 성공했습니다.");
      } else {
        setMessage(res?.result_msg || "답변 등록에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      setMessage("답변 등록 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#020617" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "24px 28px" }}>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{
            marginBottom: "12px",
            padding: "4px 10px",
            borderRadius: "9999px",
            border: "1px solid rgba(148,163,184,0.8)",
            backgroundColor: "#020617",
            color: "#e5e7eb",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          ← 문의 목록으로
        </button>

        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f9fafb", marginBottom: "4px" }}>
          문의 상세
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
          문의 내용과 답변을 관리하는 화면입니다.
        </p>

        <div
          style={{
            backgroundColor: "#020617",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.65)",
            marginBottom: "16px",
          }}
        >
          <h2
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#f9fafb",
              marginBottom: "8px",
            }}
          >
            문의 제목 (연동 필요)
          </h2>
          <p style={{ fontSize: "13px", color: "#9ca3af" }}>
            현재 문의 상세 조회 API 정보가 없어, 제목/내용은 백엔드 연동 후 표시해야 합니다.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            backgroundColor: "#020617",
            borderRadius: "12px",
            padding: "16px",
            border: "1px solid rgba(148,163,184,0.35)",
            boxShadow: "0 8px 24px rgba(15,23,42,0.65)",
          }}
        >
          <h3
            style={{
              fontSize: "15px",
              fontWeight: "600",
              color: "#f9fafb",
              marginBottom: "8px",
            }}
          >
            답변 등록
          </h3>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={5}
            style={{
              width: "100%",
              resize: "vertical",
              padding: "8px 10px",
              borderRadius: "8px",
              border: "1px solid rgba(148,163,184,0.6)",
              backgroundColor: "#020617",
              color: "#e5e7eb",
              fontSize: "13px",
            }}
            placeholder="사용자에게 전달할 답변 내용을 입력해주세요."
          />
          {message && (
            <div style={{ marginTop: "8px", fontSize: "13px", color: "#e5e7eb" }}>
              {message}
            </div>
          )}
          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: "10px",
              padding: "8px 12px",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: saving ? "#4b5563" : "#4f46e5",
              color: "#e5e7eb",
              fontSize: "14px",
              fontWeight: "600",
              cursor: saving ? "default" : "pointer",
            }}
          >
            {saving ? "등록 중..." : "답변 등록"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AdminInquiryDetailPage;
