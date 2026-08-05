import { Request, Response } from "express";

import {
  createOpportunity,
  getAllOpportunities,
  getOpportunityById,
  updateOpportunity,
  deleteOpportunity,
} from "../../services/opportunities/opportunity.service";

// CREATE
export const createOpportunityController = async (
  req: Request,
  res: Response
) => {
  const opportunity = await createOpportunity(
    req.user!.id,
    req.body
  );

  return res.status(201).json({
    success: true,
    message: "Opportunity created successfully",
    data: opportunity,
  });
};

// GET ALL
export const getAllOpportunityController = async (
  req: Request,
  res: Response
) => {
  const opportunities = await getAllOpportunities();

  return res.status(200).json({
    success: true,
    data: opportunities,
  });
};

// GET ONE
export const getSingleOpportunityController = async (
  req: Request,
  res: Response
) => {
  const opportunity = await getOpportunityById(
    req.params.id
  );

  return res.status(200).json({
    success: true,
    data: opportunity,
  });
};

// UPDATE
export const updateOpportunityController = async (
  req: Request,
  res: Response
) => {
  const opportunity = await updateOpportunity(
    req.params.id,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Opportunity updated successfully",
    data: opportunity,
  });
};

// DELETE
export const deleteOpportunityController = async (
  req: Request,
  res: Response
) => {
  await deleteOpportunity(req.params.id);

  return res.status(200).json({
    success: true,
    message: "Opportunity deleted successfully",
  });
};
