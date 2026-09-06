import api from "./api";
import type { Subject } from "../types";

export interface CreateSubjectPayload {
  name: string;
  code: string;
  semester: number;
  departmentId: string;
}

export const getSubjects = async (): Promise<Subject[]> => {
  const response = await api.get("/subjects");
  return response.data.data as Subject[];
};

export const createSubject = async (
  data: CreateSubjectPayload
) => {
  const response = await api.post("/subjects", data);
  return response.data;
};
