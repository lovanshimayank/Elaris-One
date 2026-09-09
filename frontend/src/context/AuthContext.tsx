import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { User } from "../types";
import * as authService from "../services/auth.service";
import api from "../services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    enrollmentNumber: string;
    fullName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore authentication from HTTP-only cookie
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const response = await api.get("/auth/me");

        if (response.data?.success && response.data?.data) {
          setUser(response.data.data);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (
    email: string,
    password: string
  ) => {
    const response = await authService.login({
      email,
      password,
    });

    if (!response.data?.user) {
      throw new Error("Login response did not contain user data.");
    }

    setUser(response.data.user);
  };

  const register = async (data: {
    enrollmentNumber: string;
    fullName: string;
    email: string;
    password: string;
  }) => {
    const response = await authService.register(data);

    if (!response.data?.user) {
      throw new Error(
        "Registration response did not contain user data."
      );
    }

    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: null,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};