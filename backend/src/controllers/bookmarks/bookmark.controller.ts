import { Request, Response } from "express";
import {
  addBookmark,
  getBookmarks,
  removeBookmark,
} from "../../services/bookmarks/bookmark.service";

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const createBookmark = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const bookmark = await addBookmark(
    req.user!.id,
    req.body
  );

  res.status(201).json({
    success: true,
    data: bookmark,
  });
};

export const allBookmarks = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const bookmarks = await getBookmarks(
    req.user!.id
  );

  res.json({
    success: true,
    data: bookmarks,
  });
};

export const deleteBookmark = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  await removeBookmark(
    req.params.id as string,
    req.user!.id
  );

  res.json({
    success: true,
    message: "Bookmark removed",
  });
};