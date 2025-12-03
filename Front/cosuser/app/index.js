// app/index.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter, Redirect } from "expo-router"; // 🔹 Redirect 추가
import { useAuth } from "../hooks/useAuth";
import { fetchRecommendations } from "../api/recommendations";

export default function HomeScreen() {
  const router = useRouter();
  const { user, loading } = useAuth(); // 🔹 loading도 같이 사용
  const [recsLoading, setRecsLoading] = useState(true); // 추천 로딩 상태 별도
  const [recs, setRecs] = useState([]);

  // 🔹 아직 AuthContext에서 로딩 중이면 아무 것도 안 보여줌 (스플래시/로딩)
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  // 🔹 로그인 안 되어 있으면 /login 으로 보내기
  if (!user) {
    return <Redirect href="/login" />; // ⬅️ 로그인 화면 경로에 맞게 수정
  }

  // 🔹 여기부터는 "로그인 된 상태" 전용 홈 화면
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchRecommendations();
        setRecs(data?.courses || data?.places || data || []);
      } catch (e) {
        console.error(e);
        // 추천 실패해도 홈 자체는 뜨게 함
      } finally {
        setRecsLoading(false);
      }
    };
    load();
  }, []);

  const goSearch = () => router.push("/place-search");
  const goPreferences = () => router.push("/preferences");
  const goRecommendations = () => router.push("/recommendations");
  const goMyPage = () => router.push("/my-page");
  const goCommunity = () => router.push("/community");

  const renderRecItem = ({ item }) => (
    <TouchableOpacity
      style={{
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        marginRight: 10,
        width: 220,
      }}
      onPress={() => router.push(`/place/${item.placeId || item.id}`)}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>
        {item.name || item.placeName}
      </Text>
      {item.tags && (
        <Text style={{ marginTop: 4, color: "#6b7280" }}>
          {Array.isArray(item.tags) ? item.tags.join(", ") : item.tags}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* 상단 인사 */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>
          안녕하세요, {user?.name || "코스메이트"}님 👋
        </Text>
        <Text style={{ marginTop: 6, color: "#4b5563" }}>
          리뷰 기반 AI 맞춤 관광지 추천 서비스, 코스메이트입니다.
        </Text>
      </View>

      {/* 주요 액션 버튼들 */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <TouchableOpacity style={cardBtn} onPress={goPreferences}>
          <Text style={cardBtnTitle}>취향 태그</Text>
          <Text style={cardBtnDesc}>나만의 여행 스타일 설정</Text>
        </TouchableOpacity>

        <TouchableOpacity style={cardBtn} onPress={goRecommendations}>
          <Text style={cardBtnTitle}>AI 추천 코스</Text>
          <Text style={cardBtnDesc}>맞춤 관광 코스 받기</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={{
          padding: 14,
          borderRadius: 999,
          backgroundColor: "#4F46E5",
          alignItems: "center",
          marginBottom: 12,
        }}
        onPress={goSearch}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          관광지 찾으러 가기
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          padding: 12,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "#e5e7eb",
          alignItems: "center",
          marginBottom: 16,
        }}
        onPress={goCommunity}
      >
        <Text style={{ fontWeight: "500" }}>공지 / 문의(커뮤니티) 보기</Text>
      </TouchableOpacity>

      {/* 추천 섹션 */}
      <View style={{ marginTop: 8, marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 4 }}>
          오늘의 추천 코스
        </Text>
        <Text style={{ color: "#6b7280", marginBottom: 8 }}>
          취향 태그를 기반으로 추천된 관광지들이에요.
        </Text>
      </View>

      {recsLoading ? (
        <ActivityIndicator />
      ) : recs.length === 0 ? (
        <Text style={{ color: "#9ca3af" }}>
          아직 추천 결과가 없습니다. 취향 태그를 먼저 설정해 보세요.
        </Text>
      ) : (
        <FlatList
          data={recs}
          keyExtractor={(item) => String(item.placeId || item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderRecItem}
        />
      )}

      {/* 하단 마이페이지 바로가기 */}
      <TouchableOpacity
        style={{
          position: "absolute",
          right: 16,
          bottom: 16,
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 999,
          backgroundColor: "#111827",
        }}
        onPress={goMyPage}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>마이페이지</Text>
      </TouchableOpacity>
    </View>
  );
}

const cardBtn = {
  flex: 1,
  marginRight: 8,
  padding: 12,
  borderRadius: 12,
  backgroundColor: "#EEF2FF",
};

const cardBtnTitle = {
  fontSize: 15,
  fontWeight: "600",
};

const cardBtnDesc = {
  marginTop: 4,
  fontSize: 12,
  color: "#4b5563",
};
