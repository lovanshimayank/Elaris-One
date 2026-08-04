import { Request, Response } from "express";

import {
    createNote,
    getAllNotes,
    getNoteById,
    updateNote,
    deleteNote
} from "../../services/notes/note.service";



export const createNoteController = async(
    req:Request,
    res:Response
)=>{

    const note = await createNote(
        req.user!.id,
        req.body
    );


    res.status(201).json({
        success:true,
        message:"Note created successfully",
        data:note
    });

};



export const getNotesController = async(
    req:Request,
    res:Response
)=>{

    const notes = await getAllNotes();


    res.json({
        success:true,
        data:notes
    });

};



export const getNoteController = async(
    req:Request,
    res:Response
)=>{

    const note = await getNoteById(
        req.params.id
    );


    res.json({
        success:true,
        data:note
    });

};



export const updateNoteController = async(
    req:Request,
    res:Response
)=>{

    const note = await updateNote(
        req.params.id,
        req.body
    );


    res.json({
        success:true,
        message:"Note updated",
        data:note
    });

};



export const deleteNoteController = async(
    req:Request,
    res:Response
)=>{

    await deleteNote(
        req.params.id
    );


    res.json({
        success:true,
        message:"Note deleted"
    });

};