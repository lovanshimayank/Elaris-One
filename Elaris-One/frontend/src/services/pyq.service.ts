import api from "./api";
import type { PYQ } from "../types";

export interface PYQFilters {
  search?: string;
  subjectId?: string;
  branch?: string;
  semester?: number;
  year?: number;
}

export interface CreatePYQPayload {
  title: string;
  subjectId: string;
  semester: number;
  branch: string;
  year: number;
  pdfUrl: string;
}

export interface UpdatePYQPayload {
  title?: string;
  subjectId?: string;
  semester?: number;
  branch?: string;
  year?: number;
  pdfUrl?: string;
}

export const getPYQs = async (
  filters?: PYQFilters
): Promise<PYQ[]> => {
  const response = await api.get("/pyqs", { params: filters });
  return response.data.data as PYQ[];
};

export const getPYQById = async (id: string): Promise<PYQ> => {
  const response = await api.get(`/pyqs/${id}`);
  return response.data.data as PYQ;
};

export const createPYQ = async (data: CreatePYQPayload) => {
  const response = await api.post("/pyqs", data);
  return response.data;
};

export const updatePYQ = async (
  id: string,
  data: UpdatePYQPayload
) => {
  const response = await api.patch(`/pyqs/${id}`, data);
  return response.data;
};

export const deletePYQ = async (id: string) => {
  const response = await api.delete(`/pyqs/${id}`);
  return response.data;
};
