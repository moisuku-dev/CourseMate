
//본코드
// context/AuthContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { login as loginApi, fetchMe } from "../api/auth";

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

const TOKEN_KEY = "cosmate_user_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 토큰 로드 + 내 정보 요청
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          try {
            const me = await fetchMe();
            setUser(me);
          } catch (e) {
            console.warn("fetchMe failed, clearing token", e);
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.warn("Failed to load token", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    // 서버에서 { token, user? } 형식으로 온다고 가정
    const res = await loginApi({ email, password });

    const newToken = res.token;
    if (!newToken) {
      throw new Error("Token not found in login response");
    }

    setToken(newToken);
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);

    if (res.user) {
      setUser(res.user);
    } else {
      // 응답에 user가 없으면 따로 /users/me 호출
      try {
        const me = await fetchMe();
        setUser(me);
      } catch (e) {
        console.warn("fetchMe after login failed", e);
      }
    }
  }, []);

  const handleLogout = useCallback(async () => {
    setUser(null);
    setToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }, []);

  

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
      return me;
    } catch (e) {
      console.warn("refreshUser failed", e);
      throw e;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/*
//테스트용
// context/AuthContext.js
import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { login as loginApi, fetchMe } from "../api/auth";

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

const TOKEN_KEY = "cosmate_user_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 토큰 로드 + 내 정보 요청
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (storedToken) {
          setToken(storedToken);
          try {
            const me = await fetchMe();
            setUser(me);
          } catch (e) {
            console.warn("fetchMe failed, clearing token", e);
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.warn("Failed to load token", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogin = useCallback(async (email, password) => {
    // 🔥 테스트용 강제 로그인 패스
    if (email === "asdf" && password === "asdf") {
      const fakeToken = "dev-token";
      const fakeUser = {
        id: 0,
        name: "테스트 사용자",
        email,
      };

      setToken(fakeToken);
      try {
        await SecureStore.setItemAsync(TOKEN_KEY, fakeToken);
      } catch (e) {
        console.warn("SecureStore set failed (dev mode)", e);
      }

      setUser(fakeUser);
      return; // 여기서 함수 종료 (진짜 loginApi 호출 안 함)
    }

    // 서버 로그인
    const res = await loginApi({ email, password });

    const newToken = res.token;
    if (!newToken) {
      throw new Error("Token not found in login response");
    }

    setToken(newToken);
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);

    if (res.user) {
      setUser(res.user);
    } else {
      // 응답에 user가 없으면 따로 /users/me 호출
      try {
        const me = await fetchMe();
        setUser(me);
      } catch (e) {
        console.warn("fetchMe after login failed", e);
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
  setUser(null);
  setToken(null);
  }, []);
  

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me);
      return me;
    } catch (e) {
      console.warn("refreshUser failed", e);
      throw e;
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

*/