// app/preferences.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { fetchPreferences, updatePreferences } from "../api/user";

const ALL_TAGS = [
  "#분위기좋은",
  "#가성비",
  "#조용한",
  "#사진맛집",
  "#친절한",
  "#가족여행",
  "#커플여행",
  "#혼자여행",
];

export default function PreferencesScreen() {
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPreferences();
        const tags = data?.tags || data || [];
        setSelected(tags);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  const toggleTag = (tag) => {
    if (selected.includes(tag)) {
      setSelected(selected.filter((t) => t !== tag));
    } else {
      setSelected([...selected, tag]);
    }
  };

  const onSave = async () => {
    try {
      setSaving(true);
      await updatePreferences(selected);
      Alert.alert("완료", "취향 태그가 저장되었습니다.");
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "취향 태그 저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 8 }}>
        내 취향 태그
      </Text>
      <Text style={{ color: "#666", marginBottom: 12 }}>
        본인의 여행 스타일에 맞는 태그를 선택해 주세요.
      </Text>

      <FlatList
        data={ALL_TAGS}
        keyExtractor={(item) => item}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => {
          const active = selected.includes(item);
          return (
            <TouchableOpacity
              onPress={() => toggleTag(item)}
              style={{
                flex: 1,
                margin: 4,
                paddingVertical: 10,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? "#4F46E5" : "#ccc",
                backgroundColor: active ? "#EEF2FF" : "#fff",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: active ? "#4F46E5" : "#333",
                  fontWeight: active ? "600" : "400",
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <TouchableOpacity
        onPress={onSave}
        disabled={saving}
        style={{
          marginTop: 20,
          backgroundColor: "#4F46E5",
          paddingVertical: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {saving ? "저장 중..." : "저장하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
