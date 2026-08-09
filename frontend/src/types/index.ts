export interface User {
  id: string;
  enrollmentNumber: string;
  fullName: string;
  email: string;
  phone?: string | null;
  college?: string | null;
  branch?: string | null;
  year?: number | null;
  semester?: number | null;
  section?: string | null;
  profileImage?: string | null;
  github?: string | null;
  linkedin?: string | null;
  bio?: string | null;
  skills: string[];
  role: "STUDENT" | "FACULTY" | "ADMIN";
  departmentId?: string | null;
  isVerified: boolean;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  semester: number;
  departmentId: string;
}

export interface Note {
  id: string;
  title: string;
  description?: string | null;
  subjectId: string;
  semester: number;
  branch: string;
  pdfUrl: string;
  thumbnail?: string | null;
  downloads: number;
  isApproved: boolean;
  isPublic: boolean;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  subject?: Subject;
  uploadedBy?: {
    id: string;
    fullName: string;
    role?: string;
  };
}

export interface PYQ {
  id: string;
  title: string;
  subjectId: string;
  semester: number;
  branch: string;
  year: number;
  pdfUrl: string;
  downloads: number;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
  subject?: Subject;
  uploadedBy?: {
    id: string;
    fullName: string;
  };
}