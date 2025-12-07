// context/AuthContext.js
// 실제 서비스 배포용 AuthContext
// - 앱 시작 시 SecureStore에서 토큰 로드
// - 토큰 있으면 /users/me/settings로 내 정보 조회
// - login() 호출 시 /auth/login 연동
// - logout() 호출 시 토큰 삭제 + 상태 초기화

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { login as loginApi, fetchMe } from "../api/auth";

const TOKEN_KEY = "cosmate_user_token";

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * 앱 시작 시:
   * 1) SecureStore에서 토큰 로드
   * 2) 토큰 있으면 fetchMe()로 내 정보 조회
   */
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);

        if (!storedToken) {
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
          return;
        }

        if (isMounted) {
          setToken(storedToken);
        }

        try {
          const me = await fetchMe();
          if (isMounted) {
            // fetchMe()는 api/auth.js 기준으로 data.setting을 반환함
            // 즉, { name, email, age, gender, is_active } 형태
            setUser(me || null);
          }
        } catch (e) {
          console.warn("fetchMe failed, clearing token", e);
          // 내 정보 조회 실패 시 토큰 초기화
          await SecureStore.deleteItemAsync(TOKEN_KEY);
          if (isMounted) {
            setToken(null);
            setUser(null);
          }
        }
      } catch (e) {
        console.warn("Failed to load token", e);
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * 로그인
   * - login(email, password)
   * - 또는 login({ email, password }) 둘 다 지원
   */
  const handleLogin = useCallback(async (arg1, arg2) => {
    let email;
    let password;

    if (typeof arg1 === "string") {
      email = arg1;
      password = arg2;
    } else if (arg1 && typeof arg1 === "object") {
      email = arg1.email;
      password = arg1.password;
    }

    if (!email || !password) {
      throw new Error("이메일과 비밀번호를 입력해주세요.");
    }

    // 실제 로그인 API 호출
    // api/auth.js 기준: login({ email, password }) → request("/auth/login", ...)
    const res = await loginApi({ email, password });

    /**
     * ⚠️ 여기서 백엔드 응답 형식에 맞게 토큰 필드를 맞춰야 함.
     * 예)
     *  - { token: "..." }
     *  - 또는 { accessToken: "..." }
     * 지금은 token > accessToken 순으로 찾도록 구현해둠.
     */
    const nextToken = res?.token ?? res?.accessToken ?? null;

    if (!nextToken) {
      throw new Error("로그인 응답에 토큰이 없습니다. 백엔드 응답 형식을 확인하세요.");
    }

    // 토큰 저장
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, String(nextToken));
    } catch (e) {
      console.warn("Failed to save token", e);
    }

    setToken(String(nextToken));

    /**
     * 유저 정보 세팅
     * - 백엔드에서 login 응답에 user/setting 정보를 같이 내려주면
     *   그걸 바로 사용.
     * - 없다면, fetchMe() 한 번 더 호출해서 설정값 조회.
     */
    if (res?.user || res?.setting) {
      const baseUser = res.user || res.setting;
      setUser(baseUser);
    } else {
      try {
        const me = await fetchMe();
        setUser(me || null);
      } catch (e) {
        console.warn("fetchMe after login failed", e);
        setUser(null);
      }
    }

    return res;
  }, []);

  /**
   * 로그아웃
   * - SecureStore 토큰 삭제
   * - user/token 상태 초기화
   */
  const handleLogout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn("Failed to delete token on logout", e);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  /**
   * 내 정보 새로고침
   * - 마이페이지 진입 시, 프로필 갱신 등 원하는 타이밍에 사용
   */
  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me || null);
      return me;
    } catch (e) {
      console.warn("refreshUser failed", e);
      return null;
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


/*// 🔥 TEST LOGIN VERSION
// context/AuthContext.js

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import * as SecureStore from "expo-secure-store";
import { fetchMe } from "../api/auth"; // loginApi는 테스트 버전에선 사용 안 함

const TOKEN_KEY = "cosmate_user_token";

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 시작 시 토큰 로드 + (있으면) 내 정보 요청
  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        if (!storedToken) {
          if (isMounted) {
            setUser(null);
            setToken(null);
          }
          return;
        }

        if (isMounted) {
          setToken(storedToken);
        }

        try {
          const me = await fetchMe();
          if (isMounted) {
            setUser(me || null);
          }
        } catch (e) {
          console.warn("fetchMe failed in test login version", e);
        }
      } catch (e) {
        console.warn("Failed to load token", e);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // 🔑 테스트 로그인: 이메일/비번만 있으면 무조건 성공
  const handleLogin = useCallback(async (arg1, arg2) => {
    let email;
    let password;

    if (typeof arg1 === "string") {
      email = arg1;
      password = arg2;
    } else if (arg1 && typeof arg1 === "object") {
      email = arg1.email;
      password = arg1.password;
    }

    if (!email || !password) {
      throw new Error("이메일과 비밀번호를 입력해주세요.");
    }

    const fakeToken = "test_login_token";

    try {
      await SecureStore.setItemAsync(TOKEN_KEY, fakeToken);
    } catch (e) {
      console.warn("Failed to save token in test login", e);
    }

    setToken(fakeToken);
    setUser({
      name: "테스트 사용자",
      email,
    });

    return {
      token: fakeToken,
      user: {
        name: "테스트 사용자",
        email,
      },
    };
  }, []);

  // 로그아웃: 토큰 삭제 + 상태 초기화
  const handleLogout = useCallback(async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch (e) {
      console.warn("Failed to delete token on logout", e);
    } finally {
      setUser(null);
      setToken(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await fetchMe();
      setUser(me || null);
      return me;
    } catch (e) {
      console.warn("refreshUser failed in test login", e);
      return null;
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