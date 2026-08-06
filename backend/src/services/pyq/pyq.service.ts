import { prisma } from "../../lib/prisma";


export const createPYQ = async (
    userId:string,
    data:any
)=>{

    console.log("Incoming Data:", data);
      
    return prisma.pYQ.create({
        data:{
            ...data,
            uploadedBy: {
    connect: {
        id: userId
    }
}
        }
    });

};



export const getAllPYQs = async ()=>{

    return prisma.pYQ.findMany({
        orderBy:{
            createdAt:"desc"
        }
    });

};



export const getPYQById = async(
    id:string
)=>{

    return prisma.pYQ.findUnique({
        where:{
            id
        }
    });

};



export const updatePYQ = async(
    id:string,
    data:any
)=>{

    return prisma.pYQ.update({
        where:{
            id
        },
        data
    });

};



export const deletePYQ = async(
    id:string
)=>{

    return prisma.pYQ.delete({
        where:{
            id
        }
    });

};