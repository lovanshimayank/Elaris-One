import { prisma } from "../../lib/prisma";


export const createNote = async (
    userId: string,
    data: any
) => {

    return prisma.note.create({
        data: {
            title: data.title,
            description: data.description,

            subject: data.subject,
            semester: data.semester,
            branch: data.branch,

            pdfUrl: data.pdfUrl,

            uploadedById: userId
        }
    });

};



export const getAllNotes = async () => {

    return prisma.note.findMany({
        include:{
            uploadedBy:{
                select:{
                    id:true,
                    fullName:true,
                    role:true
                }
            }
        },
        orderBy:{
            createdAt:"desc"
        }
    });

};



export const getNoteById = async (
    id:string
)=>{

    return prisma.note.findUnique({
        where:{
            id
        },
        include:{
            uploadedBy:{
                select:{
                    id:true,
                    fullName:true
                }
            }
        }
    });

};



export const updateNote = async(
    id:string,
    data:any
)=>{

    return prisma.note.update({

        where:{
            id
        },

        data

    });

};



export const deleteNote = async(
    id:string
)=>{

    return prisma.note.delete({

        where:{
            id
        }

    });

};