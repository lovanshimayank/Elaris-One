import api from "./api";
import type { Note } from "../types";

export interface NoteFilters {
  search?: string;
  subjectId?: string;
  branch?: string;
  semester?: number;
}

export interface CreateNotePayload {
  title: string;
  description?: string;
  subjectId: string;
  semester: number;
  branch: string;
  pdfUrl: string;
}

export interface UpdateNotePayload {
  title?: string;
  description?: string;
  subjectId?: string;
  semester?: number;
  branch?: string;
  pdfUrl?: string;
}

export const getNotes = async (
  filters?: NoteFilters
): Promise<Note[]> => {
  const response = await api.get("/notes", { params: filters });
  return response.data.data as Note[];
};

export const getNoteById = async (id: string): Promise<Note> => {
  const response = await api.get(`/notes/${id}`);
  return response.data.data as Note;
};

export const createNote = async (
  data: CreateNotePayload
) => {
  const response = await api.post("/notes", data);
  return response.data;
};

export const updateNote = async (
  id: string,
  data: UpdateNotePayload
) => {
  const response = await api.patch(`/notes/${id}`, data);
  return response.data;
};

export const deleteNote = async (id: string) => {
  const response = await api.delete(`/notes/${id}`);
  return response.data;
};
