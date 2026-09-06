import { Request, Response } from "express";

import {
    createPYQ,
    getAllPYQs,
    getPYQById,
    updatePYQ,
    deletePYQ
} from "../../services/pyq/pyq.service";


// CREATE PYQ
export const createPYQController = async(
    req: Request,
    res: Response
)=>{

    const pyq = await createPYQ(
        req.user!.id,
        req.body
    );

    return res.status(201).json({
        success:true,
        message:"PYQ created successfully",
        data:pyq
    });
};



// GET ALL PYQs
export const getAllPYQController = async(
    req:Request,
    res:Response
)=>{

    const pyqs = await getAllPYQs();

    return res.status(200).json({
        success:true,
        data:pyqs
    });

};



// GET SINGLE PYQ

export const getSinglePYQController = async(
    req:Request,
    res:Response
)=>{

    const pyq = await getPYQById(
        req.params.id as string as string
    );


    return res.status(200).json({
        success:true,
        data:pyq
    });

};



// UPDATE PYQ

export const updatePYQController = async(
    req:Request,
    res:Response
)=>{


    const pyq = await updatePYQ(
        req.params.id as string,
        req.body
    );


    return res.status(200).json({
        success:true,
        message:"PYQ updated successfully",
        data:pyq
    });

};



// DELETE PYQ

export const deletePYQController = async(
    req:Request,
    res:Response
)=>{


    await deletePYQ(
        req.params.id as string
    );


    return res.status(200).json({
        success:true,
        message:"PYQ deleted successfully"
    });

};