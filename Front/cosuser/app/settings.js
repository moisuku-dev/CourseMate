// app/settings.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { fetchSettings, updateSettings, deleteAccount } from "../api/user";
import { useAuth } from "../hooks/useAuth";

export default function SettingsScreen() {
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState(""); // "M" / "F" 등
  const [autoLogin, setAutoLogin] = useState(true);
  const [notification, setNotification] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchSettings();
        // 서버 응답 구조에 맞게 조정 필요
        const s = data?.setting || data || {};
        setName(s.name || "");
        setAge(s.age != null ? String(s.age) : "");
        setGender(s.gender || "");
        setAutoLogin(s.autoLogin ?? true);
        setNotification(s.notification ?? true);
      } catch (e) {
        console.error(e);
        Alert.alert("오류", "설정을 불러오는 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onSave = async () => {
    try {
      await updateSettings({
        name,
        age: age ? Number(age) : null,
        gender,
        autoLogin,
        notification,
      });
      Alert.alert("완료", "설정이 저장되었습니다.");
    } catch (e) {
      console.error(e);
      Alert.alert("오류", "설정 저장에 실패했습니다.");
    }
  };

  const onDeleteAccount = () => {
    Alert.alert(
      "회원탈퇴",
      "정말 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert("완료", "회원탈퇴가 처리되었습니다.", [
                {
                  text: "확인",
                  onPress: () => logout(),
                },
              ]);
            } catch (e) {
              console.error(e);
              Alert.alert("오류", "회원탈퇴 처리 중 문제가 발생했습니다.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>설정을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 16 }}>
        환경 설정
      </Text>

      {/* 계정 정보 섹션 */}
      <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
        계정 정보
      </Text>

      <Text style={label}>이름</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={input}
        placeholder="이름"
      />

      <Text style={label}>나이</Text>
      <TextInput
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={input}
        placeholder="나이"
      />

      <Text style={label}>성별</Text>
      <TextInput
        value={gender}
        onChangeText={setGender}
        style={input}
        placeholder="예: M / F"
      />

      {/* 로그인 / 서비스 설정 섹션 */}
      <View
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTopWidth: 1,
          borderTopColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 8 }}>
          로그인 & 서비스 설정
        </Text>

        <View style={row}>
          <Text>자동 로그인</Text>
          <Switch value={autoLogin} onValueChange={setAutoLogin} />
        </View>

        <View style={row}>
          <Text>알림 받기</Text>
          <Switch value={notification} onValueChange={setNotification} />
        </View>
      </View>

      {/* 저장 버튼 */}
      <TouchableOpacity onPress={onSave} style={btnPrimary}>
        <Text style={{ color: "#fff", fontWeight: "600" }}>설정 저장</Text>
      </TouchableOpacity>

      {/* 회원탈퇴 */}
      <TouchableOpacity onPress={onDeleteAccount} style={btnDanger}>
        <Text style={{ color: "#EF4444", fontWeight: "600" }}>회원탈퇴</Text>
      </TouchableOpacity>
    </View>
  );
}

const label = {
  marginTop: 12,
  marginBottom: 4,
  fontWeight: "500",
};

const input = {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 10,
};

const row = {
  marginTop: 12,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
};

const btnPrimary = {
  marginTop: 24,
  backgroundColor: "#4F46E5",
  paddingVertical: 12,
  borderRadius: 8,
  alignItems: "center",
};

const btnDanger = {
  marginTop: 12,
  paddingVertical: 12,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: "#EF4444",
  alignItems: "center",
};
