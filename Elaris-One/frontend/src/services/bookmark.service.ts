import api from "./api";

export interface BookmarkPayload {
  noteId?: string;
  pyqId?: string;
  opportunityId?: string;
}

export const addBookmark = async (
  data: BookmarkPayload
) => {
  const response = await api.post("/bookmarks", data);
  return response.data;
};

export const getBookmarks = async () => {
  const response = await api.get("/bookmarks");
  return response.data;
};

export const removeBookmark = async (id: string) => {
  const response = await api.delete(`/bookmarks/${id}`);
  return response.data;
};