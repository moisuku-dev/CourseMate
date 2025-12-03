// src/pages/AdminPlacesPage.jsx
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  fetchPlaces,
  createPlace,
  updatePlace,
  deletePlace,
  updatePlaceVisibility,
} from "../api/adminPlaces.js";

const EMPTY_FORM = {
  name: "",
  category: "",
  area: "",
  address: "",
};

const AdminPlacesPage = () => {
  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState([]); // [{ id, name, category, area, address, rating, reviewCount, isVisible }]
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null이면 신규 등록

  const loadPlaces = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchPlaces({ keyword });
      setPlaces(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setError("관광지 목록을 불러오지 못했습니다.");
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    loadPlaces();
  };

  const handleChangeForm = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.name || !form.category || !form.area || !form.address) {
      alert("이름/카테고리/지역/주소를 모두 입력해주세요.");
      return;
    }

    try {
      if (editingId == null) {
        // 신규
        await createPlace(form);
      } else {
        // 수정
        await updatePlace(editingId, form);
      }
      resetForm();
      await loadPlaces();
    } catch (e) {
      console.error(e);
      alert("관광지 저장에 실패했습니다.");
    }
  };

  const handleEdit = (place) => {
    setEditingId(place.id);
    setForm({
      name: place.name ?? "",
      category: place.category ?? "",
      area: place.area ?? "",
      address: place.address ?? "",
    });
  };

  const handleDelete = async (place) => {
    if (!window.confirm(`'${place.name}' 관광지를 삭제할까요?`)) return;
    try {
      await deletePlace(place.id);
      await loadPlaces();
    } catch (e) {
      console.error(e);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleToggleVisibility = async (place) => {
    const next = !place.isVisible;
    if (
      !window.confirm(
        `'${place.name}' 관광지 노출 상태를 ${place.isVisible ? "비노출" : "노출"}로 변경할까요?`
      )
    ) {
      return;
    }
    try {
      await updatePlaceVisibility(place.id, next);
      await loadPlaces();
    } catch (e) {
      console.error(e);
      alert("노출 상태 변경에 실패했습니다.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>관광지 관리</h1>

        {/* 검색 영역 */}
        <form
          onSubmit={handleSearch}
          style={{ marginBottom: "12px", display: "flex", gap: "8px", flexWrap: "wrap" }}
        >
          <input
            type="text"
            placeholder="관광지명 / 지역 / 카테고리 검색"
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

        {/* 목록 */}
        <div style={{ overflowX: "auto", marginBottom: "16px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "13px",
              minWidth: "760px",
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
                  카테고리
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  지역
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  주소
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  평점
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  리뷰 수
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  노출
                </th>
                <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                  관리
                </th>
              </tr>
            </thead>
            <tbody>
              {places.map((p) => (
                <tr key={p.id}>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{p.id}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{p.name}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                    {p.category}
                  </td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{p.area}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{p.address}</td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                    {p.rating ?? "-"}
                  </td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                    {p.reviewCount ?? 0}
                  </td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                    {p.isVisible ? "노출" : "비노출"}
                  </td>
                  <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                    <button
                      type="button"
                      onClick={() => handleEdit(p)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        backgroundColor: "#111",
                        fontSize: "12px",
                        marginRight: "4px",
                      }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(p)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #444",
                        backgroundColor: "#111",
                        fontSize: "12px",
                        marginRight: "4px",
                      }}
                    >
                      {p.isVisible ? "비노출" : "노출"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(p)}
                      style={{
                        padding: "4px 8px",
                        borderRadius: "4px",
                        border: "1px solid #703030",
                        backgroundColor: "#2a0000",
                        fontSize: "12px",
                      }}
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}

              {!loading && places.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    style={{
                      padding: "8px",
                      textAlign: "center",
                      color: "#aaa",
                      borderBottom: "1px solid #333",
                    }}
                  >
                    등록된 관광지가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 등록/수정 폼 */}
        <section
          style={{
            borderRadius: "10px",
            border: "1px solid #333",
            padding: "12px",
            backgroundColor: "#111",
            maxWidth: "520px",
          }}
        >
          <h2 style={{ fontSize: "16px", marginTop: 0 }}>
            {editingId == null ? "새 관광지 등록" : `관광지 수정 (ID: ${editingId})`}
          </h2>
          <form onSubmit={handleSubmitForm}>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "13px" }}>
                이름
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChangeForm}
                  style={{
                    marginTop: "4px",
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #444",
                    backgroundColor: "#000",
                    color: "#f5f5f5",
                    fontSize: "13px",
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "13px" }}>
                카테고리
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChangeForm}
                  style={{
                    marginTop: "4px",
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #444",
                    backgroundColor: "#000",
                    color: "#f5f5f5",
                    fontSize: "13px",
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "13px" }}>
                지역
                <input
                  type="text"
                  name="area"
                  value={form.area}
                  onChange={handleChangeForm}
                  style={{
                    marginTop: "4px",
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #444",
                    backgroundColor: "#000",
                    color: "#f5f5f5",
                    fontSize: "13px",
                  }}
                />
              </label>
            </div>
            <div style={{ marginBottom: "8px" }}>
              <label style={{ fontSize: "13px" }}>
                주소
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChangeForm}
                  style={{
                    marginTop: "4px",
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    border: "1px solid #444",
                    backgroundColor: "#000",
                    color: "#f5f5f5",
                    fontSize: "13px",
                  }}
                />
              </label>
            </div>

            <div style={{ marginTop: "10px", display: "flex", gap: "8px" }}>
              <button
                type="submit"
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid #444",
                  backgroundColor: "#f5f5f5",
                  color: "#000",
                  fontSize: "13px",
                  fontWeight: "600",
                }}
              >
                {editingId == null ? "등록" : "수정 저장"}
              </button>
              {editingId != null && (
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "6px",
                    border: "1px solid #444",
                    backgroundColor: "#111",
                    fontSize: "13px",
                  }}
                >
                  새로 등록 모드로
                </button>
              )}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminPlacesPage;
