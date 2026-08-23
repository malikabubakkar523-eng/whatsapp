import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "chatflow_super_secret_jwt_key_development_2026";
const TOKEN_NAME = "chatflow_session";

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getAuthSession(req?: NextRequest | Request): Promise<JwtPayload | null> {
  let token: string | undefined;

  // Check Authorization header first
  if (req) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  // Check cookies if no header token
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(TOKEN_NAME)?.value;
    } catch {
      // Cookies might not be available in all contexts
    }
  }

  // Also check request cookies if NextRequest
  if (!token && req && "cookies" in req) {
    token = (req as NextRequest).cookies.get(TOKEN_NAME)?.value;
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  // Optional: check if user is suspended in DB
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, isSuspended: true, role: true, email: true },
  });

  if (!user || user.isSuspended) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function requireAuth(req?: NextRequest | Request): Promise<JwtPayload> {
  const session = await getAuthSession(req);
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function getCurrentUser(req?: NextRequest | Request) {
  const session = await getAuthSession(req);
  if (!session) return null;
  return { id: session.userId, email: session.email, role: session.role };
}

export const AUTH_COOKIE_NAME = TOKEN_NAME;
