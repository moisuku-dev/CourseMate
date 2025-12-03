// app/community/index.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { fetchNotices } from "../../api/community";

export default function CommunityMain() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchNotices();
        if (data.result_code === 200) {
          setNotices(data.notices || []);
        } else {
          Alert.alert("오류", data.result_msg);
        }
      } catch (e) {
        Alert.alert("오류", "공지사항 조회 실패");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#ddd" }}
      onPress={() => router.push(`/community/${item.noticeId}`)}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
      <Text style={{ fontSize: 12, color: "#666" }}>
        {new Date(item.regDate).toLocaleString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>공지사항</Text>

      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={notices}
          renderItem={renderItem}
          keyExtractor={(item) => item.noticeId}
          ListEmptyComponent={<Text>공지사항이 없습니다.</Text>}
        />
      )}

      <TouchableOpacity
        style={btnStyle.primary}
        onPress={() => router.push("/community/feedback-write")}
      >
        <Text style={btnStyle.text}>문의 보내기</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={btnStyle.secondary}
        onPress={() => router.push("/community/my-feedback")}
      >
        <Text style={btnStyle.text}>내 문의 내역</Text>
      </TouchableOpacity>
    </View>
  );
}

const btnStyle = {
  primary: {
    marginTop: 20,
    padding: 14,
    backgroundColor: "#4F46E5",
    borderRadius: 8,
    alignItems: "center",
  },
  secondary: {
    marginTop: 10,
    padding: 14,
    backgroundColor: "#6366F1",
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
  },
};
