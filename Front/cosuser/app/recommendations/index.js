// app/recommendations/index.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  fetchRecommendations,
  retryRecommendations,
} from "../../api/recommendations";
import { addToWishlist } from "../../api/user";

export default function RecommendationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recs, setRecs] = useState([]);

  const load = async () => {
    try {
      setLoading(true);
      const data = await fetchRecommendations();
      setRecs(data?.courses || data?.places || data || []);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "추천 코스를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRetry = async () => {
    try {
      setLoading(true);
      const data = await retryRecommendations();
      setRecs(data?.courses || data?.places || data || []);
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "다른 코스 추천에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const onAddWishlist = async (placeId) => {
    try {
      await addToWishlist(placeId);
      Alert.alert("완료", "위시리스트에 추가되었습니다.");
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "위시리스트 추가 실패");
    }
  };

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
        맞춤 관광 코스 추천
      </Text>
      <Text style={{ color: "#666", marginBottom: 12 }}>
        취향 태그를 기반으로 추천된 관광지 목록입니다.
      </Text>

      <FlatList
        data={recs}
        keyExtractor={(item) => String(item.placeId || item.id)}
        ListEmptyComponent={<Text>추천 결과가 없습니다.</Text>}
        renderItem={({ item }) => (
          <View
            style={{
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: "#eee",
            }}
          >
            <TouchableOpacity
              onPress={() =>
                router.push(`/place/${item.placeId || item.id}`)
              }
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {item.name || item.placeName}
              </Text>
              {item.tags && (
                <Text style={{ marginTop: 2, color: "#4B5563" }}>
                  {Array.isArray(item.tags)
                    ? item.tags.join(", ")
                    : item.tags}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onAddWishlist(item.placeId || item.id)}
              style={{
                marginTop: 6,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#4F46E5",
              }}
            >
              <Text style={{ color: "#4F46E5", fontWeight: "600" }}>
                위시리스트에 추가
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={onRetry}
        style={{
          marginTop: 16,
          paddingVertical: 12,
          borderRadius: 8,
          backgroundColor: "#6366F1",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          다른 코스 추천 받기
        </Text>
      </TouchableOpacity>
    </View>
  );
}
