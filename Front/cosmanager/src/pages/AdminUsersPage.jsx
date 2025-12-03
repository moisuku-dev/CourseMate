// src/pages/AdminUsersPage.jsx
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { fetchUsers, updateUserStatus } from "../api/adminUsers.js";

const AdminUsersPage = () => {
  const [keyword, setKeyword] = useState("");
  const [users, setUsers] = useState([]); // [{ id, name, nickname, email, status }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsers({ keyword });
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("회원 목록을 불러오지 못했습니다.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const current = user.status;
    const next = current === "active" ? "inactive" : "active";
    if (!window.confirm(`해당 회원의 상태를 '${current}' → '${next}'로 변경할까요?`)) {
      return;
    }

    try {
      await updateUserStatus(user.id, next);
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert("상태 변경에 실패했습니다.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>회원 관리</h1>

        <form
          onSubmit={handleSearch}
          style={{ marginBottom: "12px", display: "flex", gap: "8px" }}
        >
          <input
            type="text"
            placeholder="이름 / 닉네임 / 이메일 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{
              flex: "0 0 260px",
              padding: "6px 8px",
              borderRadius: "6px",
              border: "1px solid #444",
              backgroundColor: "#000",
              color: "#f5f5f5",
              fontSize: "13px",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #444",
              backgroundColor: "#111",
              fontSize: "13px",
            }}
          >
            검색
          </button>
        </form>

        {loading && <div style={{ fontSize: "13px" }}>불러오는 중...</div>}
        {error && (
          <div style={{ fontSize: "13px", color: "#ff6b6b", marginBottom: "8px" }}>
            {error}
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              minWidth: "640px",
            }}
          >
            <thead>
              <tr>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  ID
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  이름
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  닉네임
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  이메일
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  상태
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{u.id}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{u.name}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{u.nickname}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{u.email}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{u.status}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        backgroundColor: "#111",
                        fontSize: "12px",
                        marginRight: "4px",
                      }}
                    >
                      상태 변경
                    </button>
                    {/* 필요하면 정보수정/삭제 버튼도 여기 추가 가능:
                    <button ...>정보 수정</button>
                    <button ...>삭제</button>
                    */}
                  </td>
                </tr>
              ))}

              {!loading && users.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      color: "#aaa",
                      borderBottom: "1px solid #333",
                    }}
                  >
                    회원이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
