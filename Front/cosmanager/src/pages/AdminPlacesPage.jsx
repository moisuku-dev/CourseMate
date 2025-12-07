// src/pages/AdminPlacesPage.jsx
import React, { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { createAdminPlace, deleteAdminPlace } from "../api/adminPlaces.js";

const AdminPlacesPage = () => {
  const [form, setForm] = useState({
    spotId: "",
    name: "",
    address: "",
    category: "",
    latitude: "",
    longitude: "",
  });
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!form.spotId || !form.name) {
      setMessage("관광지 ID와 이름은 필수입니다.");
      return;
    }

    setCreating(true);
    try {
      const payload = {
        spotId: Number(form.spotId),
        name: form.name,
        address: form.address,
        category: form.category,
        latitude: form.latitude ? Number(form.latitude) : null,
        longitude: form.longitude ? Number(form.longitude) : null,
      };
      const res = await createAdminPlace(payload);
      if (res && res.result_code === 200) {
        setMessage("관광지 등록에 성공했습니다.");
      } else {
        setMessage(res?.result_msg || "관광지 등록에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      setMessage("관광지 등록 중 오류가 발생했습니다.");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!deleteId) {
      setMessage("삭제할 관광지 ID를 입력해주세요.");
      return;
    }
    if (!window.confirm("정말 이 관광지를 삭제하시겠습니까?")) return;
    setDeleting(true);
    try {
      const res = await deleteAdminPlace(deleteId);
      if (res && res.result_code === 200) {
        setMessage("관광지 삭제에 성공했습니다.");
      } else {
        setMessage(res?.result_msg || "관광지 삭제에 실패했습니다.");
      }
    } catch (e) {
      console.error(e);
      setMessage("관광지 삭제 중 오류가 발생했습니다.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#020617" }}>
      <AdminSidebar />
      <main style={{ flex: 1, padding: "24px 28px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#f9fafb", marginBottom: "4px" }}>
          관광지 관리
        </h1>
        <p style={{ fontSize: "13px", color: "#9ca3af", marginBottom: "16px" }}>
          관광지 정보를 등록하거나 삭제할 수 있습니다.
        </p>

        {message && (
          <div style={{ marginBottom: "12px", fontSize: "13px", color: "#e5e7eb" }}>
            {message}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 0.9fr)",
            gap: "20px",
          }}
        >
          <form
            onSubmit={handleCreate}
            style={{
              backgroundColor: "#020617",
              borderRadius: "12px",
              padding: "16px",
              border: "1px solid rgba(148,163,184,0.35)",
              boxShadow: "0 8px 24px rgba(15,23,42,0.65)",
            }}
          >
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#f9fafb",
                marginBottom: "12px",
              }}
            >
              관광지 등록
            </h2>
            <Field
              label="관광지 ID (SPOT_ID)"
              name="spotId"
              value={form.spotId}
              onChange={handleChange}
            />
            <Field label="이름" name="name" value={form.name} onChange={handleChange} />
            <Field
              label="주소"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
            <Field
              label="카테고리"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
            <Field
              label="위도"
              name="latitude"
              value={form.latitude}
              onChange={handleChange}
            />
            <Field
              label="경도"
              name="longitude"
              value={form.longitude}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={creating}
              style={{
                marginTop: "8px",
                padding: "8px 12px",
                borderRadius: "9999px",
                border: "none",
                backgroundColor: creating ? "#4b5563" : "#4f46e5",
                color: "#e5e7eb",
                fontSize: "14px",
                fontWeight: "600",
                cursor: creating ? "default" : "pointer",
              }}
            >
              {creating ? "등록 중..." : "등록"}
            </button>
          </form>

          <div>
            <form
              onSubmit={handleDelete}
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
                  marginBottom: "12px",
                }}
              >
                관광지 삭제
              </h2>
              <Field
                label="삭제할 관광지 ID (SPOT_ID)"
                name="deleteId"
                value={deleteId}
                onChange={(e) => setDeleteId(e.target.value)}
              />
              <button
                type="submit"
                disabled={deleting}
                style={{
                  marginTop: "8px",
                  padding: "8px 12px",
                  borderRadius: "9999px",
                  border: "none",
                  backgroundColor: deleting ? "#4b5563" : "#ef4444",
                  color: "#e5e7eb",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: deleting ? "default" : "pointer",
                }}
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </form>

            <div
              style={{
                backgroundColor: "#020617",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid rgba(148,163,184,0.35)",
                color: "#9ca3af",
                fontSize: "13px",
              }}
            >
              <strong>관광지 목록</strong>
              <p style={{ marginTop: "6px" }}>
                {/* TODO: 관리자용 관광지 목록 조회 API 연동 필요 */}
                현재 관리자용 관광지 목록 조회 API 정보가 없어, 이 영역은 UI만 준비된
                상태입니다. 백엔드 스펙 확정 후 목록/검색/페이징 기능을 연동해야 합니다.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, name, value, onChange }) => (
  <div style={{ marginBottom: "8px" }}>
    <label
      htmlFor={name}
      style={{ display: "block", fontSize: "13px", color: "#e5e7eb", marginBottom: "4px" }}
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        padding: "8px 10px",
        borderRadius: "8px",
        border: "1px solid rgba(148,163,184,0.6)",
        backgroundColor: "#020617",
        color: "#e5e7eb",
        fontSize: "13px",
      }}
    />
  </div>
);

export default AdminPlacesPage;
