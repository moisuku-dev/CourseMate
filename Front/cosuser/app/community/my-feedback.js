// app/community/my-feedback.js
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, Alert } from "react-native";
import { fetchMyFeedbacks } from "../../api/community";

export default function MyFeedback() {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchMyFeedbacks();
        if (data.result_code === 200) {
          setList(data.feedbacks || []);
        } else {
          Alert.alert("오류", data.result_msg);
        }
      } catch {
        Alert.alert("오류", "문의 내역 조회 실패");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <ActivityIndicator />;

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 12 }}>
        내 문의 내역
      </Text>

      <FlatList
        data={list}
        keyExtractor={(item) => item.inquiryId}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderColor: "#ddd" }}>
            <Text style={{ fontSize: 16, fontWeight: "600" }}>{item.title}</Text>
            <Text style={{ marginTop: 4 }}>상태: {item.status}</Text>
            <Text style={{ marginTop: 2, color: "#777" }}>
              문의일: {new Date(item.regDate).toLocaleString()}
            </Text>
            <Text style={{ color: "#777" }}>
              답변일: {item.answerDate ? new Date(item.answerDate).toLocaleString() : "-"}
            </Text>
          </View>
        )}
      />
    </View>
  );
}
