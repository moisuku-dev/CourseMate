// src/components/AdminSidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const linkStyle = ({ isActive }) => ({
    display: "block",
    padding: "8px 12px",
    fontSize: "14px",
    fontWeight: isActive ? "700" : "400",
    textDecoration: "none",
    borderRadius: "6px",
    backgroundColor: isActive ? "#222" : "transparent",
  });

  return (
    <aside
      style={{
        width: "220px",
        borderRight: "1px solid #333",
        padding: "16px 8px",
        boxSizing: "border-box",
        backgroundColor: "#111",
      }}
    >
      <h2 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
        코스메이트 관리자
      </h2>

      <section style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}>
          대시보드
        </div>
        <NavLink to="/admin/dashboard" style={linkStyle}>
          일일 통계
        </NavLink>
      </section>

      <section style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}>
          회원 관리
        </div>
        <NavLink to="/admin/users" style={linkStyle}>
          회원 목록
        </NavLink>
      </section>

      <section style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}>
          콘텐츠 관리
        </div>
        <NavLink to="/admin/places" style={linkStyle}>
          관광지 관리
        </NavLink>
        <NavLink to="/admin/reviews" style={linkStyle}>
          리뷰/태그 관리
        </NavLink>
      </section>

      <section style={{ marginBottom: "16px" }}>
        <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}>
          커뮤니티
        </div>
        <NavLink to="/admin/community" style={linkStyle}>
          공지/의견 관리
        </NavLink>
      </section>

      <section>
        <div style={{ fontWeight: "600", marginBottom: "4px", fontSize: "13px" }}>
          환경설정
        </div>
        <NavLink to="/admin/settings" style={linkStyle}>
          설정
        </NavLink>
      </section>
    </aside>
  );
};

export default AdminSidebar;
