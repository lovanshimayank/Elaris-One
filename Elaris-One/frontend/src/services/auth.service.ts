import api from "./api";
import type { User } from "../types";

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  enrollmentNumber: string;
  fullName: string;
  email: string;
  password: string;
  role?: "STUDENT" | "FACULTY" | "ADMIN";
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data: {
    token: string;
    user: User;
  };
}

export const login = async (
  data: LoginData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/login",
    data
  );

  return response.data;
};

export const register = async (
  data: RegisterData
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>(
    "/auth/register",
    data
  );

  return response.data;
};