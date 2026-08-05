import { Request, Response } from "express";
import { globalSearch } from "../../services/search/search.service";

export const globalSearchController = async (
  req: Request,
  res: Response
) => {
  const keyword = (req.query.q as string)?.trim();

  if (!keyword) {
    return res.status(400).json({
      success: false,
      message: "Search keyword is required",
    });
  }

  const result = await globalSearch(keyword);

  return res.status(200).json({
    success: true,
    data: result,
  });
};
