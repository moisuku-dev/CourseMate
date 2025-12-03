// app/community/[id].js
import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { View, Text, ScrollView, ActivityIndicator, Alert } from "react-native";
import { fetchNoticeDetail } from "../../api/community";

export default function NoticeDetail() {
  const { id } = useLocalSearchParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchNoticeDetail(id);
        if (data.result_code === 200) {
          setNotice(data.notice);
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
  }, [id]);

  if (loading) return <ActivityIndicator />;

  if (!notice)
    return <Text style={{ padding: 16 }}>공지사항 정보를 찾을 수 없습니다.</Text>;

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700" }}>{notice.title}</Text>
      <Text style={{ color: "#666", marginTop: 4 }}>
        {new Date(notice.regDate).toLocaleString()}
      </Text>

      <Text style={{ marginTop: 20, fontSize: 16, lineHeight: 22 }}>
        {notice.content}
      </Text>
    </ScrollView>
  );
}
