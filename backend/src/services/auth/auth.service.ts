import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../../utils/password.js";
import { generateToken } from "../../utils/jwt.js";

const prisma = new PrismaClient();

interface RegisterData {
  fullName: string;
  enrollmentNumber: string;
  email: string;
  password: string;
}

interface LoginData {
  enrollmentNumber: string;
  password: string;
}

export const registerUser = async (data: RegisterData) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { enrollmentNumber: data.enrollmentNumber },
      ],
    },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      enrollmentNumber: data.enrollmentNumber,
      email: data.email,
      password: hashedPassword,
    },
  });

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  const { password, ...safeUser } = user;
  return {
    token,
    user,
  };
};

export const loginUser = async (data: LoginData) => {
  const user = await prisma.user.findUnique({
    where: {
      enrollmentNumber: data.enrollmentNumber,
    },
  });

  if (!user) {
    throw new Error("Invalid Credentials");
  }

  const isPasswordCorrect = await comparePassword(
    data.password,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new Error("Invalid Credentials");
  }

  const token = generateToken({
    userId: user.id,
    role: user.role,
  });

  const { password, ...safeUser } = user;

  return {
    token,
    user,
  };
};