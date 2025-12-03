// src/pages/AdminReviewsTagsPage.jsx
import React, { useEffect, useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import {
  fetchReviews,
  updateReviewVisibility,
  deleteReview,
  fetchTags,
  createTag,
  updateTag,
  deleteTag,
} from "../api/adminReviews.js";

const EMPTY_TAG_FORM = {
  name: "",
  description: "",
};

const AdminReviewsTagsPage = () => {
  const [keyword, setKeyword] = useState("");
  const [reviews, setReviews] = useState([]); // [{ id, placeName, userNickname, rating, content, createdAt, visible }]
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");

  const [tags, setTags] = useState([]); // [{ id, name, description, isActive }]
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState("");
  const [tagForm, setTagForm] = useState(EMPTY_TAG_FORM);
  const [editingTagId, setEditingTagId] = useState(null);

  const loadReviews = async () => {
    setReviewsLoading(true);
    setReviewsError("");
    try {
      const data = await fetchReviews({ keyword });
      setReviews(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setReviewsError("리뷰 목록을 불러오지 못했습니다.");
      setReviews([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const loadTags = async () => {
    setTagsLoading(true);
    setTagsError("");
    try {
      const data = await fetchTags();
      setTags(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTagsError("태그 목록을 불러오지 못했습니다.");
      setTags([]);
    } finally {
      setTagsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    loadTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchReviews = (e) => {
    e.preventDefault();
    loadReviews();
  };

  const handleToggleReviewVisibility = async (review) => {
    const next = !review.visible;
    if (
      !window.confirm(
        `해당 리뷰를 ${review.visible ? "비노출(숨김)" : "노출"} 상태로 변경할까요?`
      )
    ) {
      return;
    }
    try {
      await updateReviewVisibility(review.id, next);
      await loadReviews();
    } catch (e) {
      console.error(e);
      alert("리뷰 노출 상태 변경에 실패했습니다.");
    }
  };

  const handleDeleteReview = async (review) => {
    if (!window.confirm("해당 리뷰를 삭제할까요?")) return;
    try {
      await deleteReview(review.id);
      await loadReviews();
    } catch (e) {
      console.error(e);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  const handleChangeTagForm = (e) => {
    const { name, value } = e.target;
    setTagForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetTagForm = () => {
    setTagForm(EMPTY_TAG_FORM);
    setEditingTagId(null);
  };

  const handleSubmitTagForm = async (e) => {
    e.preventDefault();
    if (!tagForm.name) {
      alert("태그명을 입력해주세요.");
      return;
    }
    try {
      if (editingTagId == null) {
        await createTag(tagForm);
      } else {
        await updateTag(editingTagId, tagForm);
      }
      resetTagForm();
      await loadTags();
    } catch (e) {
      console.error(e);
      alert("태그 저장에 실패했습니다.");
    }
  };

  const handleEditTag = (tag) => {
    setEditingTagId(tag.id);
    setTagForm({
      name: tag.name ?? "",
      description: tag.description ?? "",
    });
  };

  const handleDeleteTag = async (tag) => {
    if (!window.confirm(`'${tag.name}' 태그를 삭제할까요?`)) return;
    try {
      await deleteTag(tag.id);
      await loadTags();
    } catch (e) {
      console.error(e);
      alert("태그 삭제에 실패했습니다.");
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <AdminSidebar />
      <div style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ fontSize: "20px", marginBottom: "12px" }}>리뷰 / 태그 관리</h1>

        {/* 리뷰 관리 */}
        <section style={{ marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>리뷰 관리</h2>
          <form
            onSubmit={handleSearchReviews}
            style={{ marginBottom: "8px", display: "flex", gap: "8px" }}
          >
            <input
              type="text"
              placeholder="관광지명 / 닉네임 / 내용 검색"
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

          {reviewsLoading && <div style={{ fontSize: "13px" }}>리뷰 불러오는 중...</div>}
          {reviewsError && (
            <div style={{ fontSize: "13px", color: "#ff6b6b", marginBottom: "8px" }}>
              {reviewsError}
            </div>
          )}

          <div style={{ overflowX: "auto" }}>
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
                    관광지
                  </th>
                  <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                    작성자
                  </th>
                  <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                    평점
                  </th>
                  <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                    내용
                  </th>
                  <th style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}>
                    작성일
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
                {reviews.map((r) => (
                  <tr key={r.id}>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{r.id}</td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      {r.placeName}
                    </td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      {r.userNickname}
                    </td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      {r.rating}
                    </td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      {r.content}
                    </td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      {r.createdAt}
                    </td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      {r.visible ? "노출" : "비노출"}
                    </td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      <button
                        type="button"
                        onClick={() => handleToggleReviewVisibility(r)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          border: "1px solid #444",
                          backgroundColor: "#111",
                          fontSize: "12px",
                          marginRight: "4px",
                        }}
                      >
                        {r.visible ? "숨기기" : "보이기"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteReview(r)}
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

                {!reviewsLoading && reviews.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "#aaa",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      등록된 리뷰가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 태그 관리 */}
        <section>
          <h2 style={{ fontSize: "16px", marginBottom: "8px" }}>태그 관리</h2>

          {tagsLoading && <div style={{ fontSize: "13px" }}>태그 불러오는 중...</div>}
          {tagsError && (
            <div style={{ fontSize: "13px", color: "#ff6b6b", marginBottom: "8px" }}>
              {tagsError}
            </div>
          )}

          <div style={{ overflowX: "auto", marginBottom: "12px" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
                minWidth: "520px",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}
                  >
                    ID
                  </th>
                  <th
                    style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}
                  >
                    태그명
                  </th>
                  <th
                    style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}
                  >
                    설명
                  </th>
                  <th
                    style={{ padding: "6px", borderBottom: "1px solid #444", textAlign: "left" }}
                  >
                    관리
                  </th>
                </tr>
              </thead>
              <tbody>
                {tags.map((t) => (
                  <tr key={t.id}>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{t.id}</td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>{t.name}</td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      {t.description}
                    </td>
                    <td style={{ padding: "6px", borderBottom: "1px solid #333" }}>
                      <button
                        type="button"
                        onClick={() => handleEditTag(t)}
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
                        onClick={() => handleDeleteTag(t)}
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

                {!tagsLoading && tags.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      style={{
                        padding: "8px",
                        textAlign: "center",
                        color: "#aaa",
                        borderBottom: "1px solid #333",
                      }}
                    >
                      등록된 태그가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 태그 등록/수정 폼 */}
          <div
            style={{
              borderRadius: "10px",
              border: "1px solid #333",
              padding: "12px",
              backgroundColor: "#111",
              maxWidth: "480px",
            }}
          >
            <h3 style={{ fontSize: "14px", marginTop: 0 }}>
              {editingTagId == null ? "새 태그 등록" : `태그 수정 (ID: ${editingTagId})`}
            </h3>
            <form onSubmit={handleSubmitTagForm}>
              <div style={{ marginBottom: "8px" }}>
                <label style={{ fontSize: "13px" }}>
                  태그명
                  <input
                    type="text"
                    name="name"
                    value={tagForm.name}
                    onChange={handleChangeTagForm}
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
                  설명
                  <textarea
                    name="description"
                    value={tagForm.description}
                    onChange={handleChangeTagForm}
                    rows={3}
                    style={{
                      marginTop: "4px",
                      width: "100%",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      border: "1px solid #444",
                      backgroundColor: "#000",
                      color: "#f5f5f5",
                      fontSize: "13px",
                      resize: "vertical",
                    }}
                  />
                </label>
              </div>

              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
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
                  {editingTagId == null ? "등록" : "수정 저장"}
                </button>
                {editingTagId != null && (
                  <button
                    type="button"
                    onClick={resetTagForm}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      border: "1px solid #444",
                      backgroundColor: "#111",
                      fontSize: "13px",
                    }}
                  >
                    새 등록 모드로
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminReviewsTagsPage;
