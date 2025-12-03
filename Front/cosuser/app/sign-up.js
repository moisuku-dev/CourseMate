// app/sign-up.js
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter, Link } from "expo-router";
import ScreenContainer from "../components/ScreenContainer";
import CommonButton from "../components/CommonButton";
import COLORS from "../constants/colors";
import { signUp } from "../api/auth";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async () => {
    if (password !== passwordCheck) {
      setError("비밀번호가 서로 일치하지 않습니다.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await signUp({ email, password, nickname });
      router.replace("/login");
    } catch (e) {
      console.warn(e);
      setError("회원가입에 실패했습니다. 입력값을 다시 확인해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>회원가입</Text>
        <Text style={styles.subtitle}>COSMATE와 함께 여행 코스를 만들어 보세요</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="example@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={styles.input}
          placeholder="닉네임"
          value={nickname}
          onChangeText={setNickname}
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호 확인"
          secureTextEntry
          value={passwordCheck}
          onChangeText={setPasswordCheck}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <CommonButton
          title="회원가입 완료"
          onPress={handleSignUp}
          disabled={
            submitting ||
            !email ||
            !nickname ||
            !password ||
            !passwordCheck
          }
        />

        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text style={styles.linkText}>이미 계정이 있으신가요? 로그인</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: COLORS.muted,
  },
  form: {
    marginTop: 4,
  },
  label: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  error: {
    marginTop: 8,
    color: COLORS.danger,
    fontSize: 13,
  },
  linkText: {
    marginTop: 16,
    fontSize: 13,
    color: COLORS.primary,
    textAlign: "center",
  },
});
