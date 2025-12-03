// app/community/feedback-write.js
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { createFeedback } from "../../api/community";
import { useRouter } from "expo-router";

export default function FeedbackWrite() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("알림", "제목과 내용을 모두 입력하세요.");
      return;
    }

    try {
      setSending(true);
      const data = await createFeedback({ title, content });

      if (data.result_code === 200) {
        Alert.alert("문의 등록 완료", data.result_msg, [
          {
            text: "확인",
            onPress: () => router.back(),
          },
        ]);
      } else {
        Alert.alert("오류", data.result_msg);
      }
    } catch (e) {
      Alert.alert("오류", "문의 등록 실패");
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: "700", marginBottom: 20 }}>
        문의 보내기
      </Text>

      <TextInput
        placeholder="제목"
        style={input}
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        placeholder="내용"
        style={[input, { height: 150 }]}
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity
        style={btn}
        onPress={submit}
        disabled={sending}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {sending ? "전송 중..." : "등록하기"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const input = {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 12,
  marginTop: 12,
};

const btn = {
  marginTop: 20,
  backgroundColor: "#4F46E5",
  padding: 14,
  borderRadius: 8,
  alignItems: "center",
};
