import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs"; 
import { addCors, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function POST(req: Request) {
  const body = await req.json();

  try {

    const email = body.email;

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(body.password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role,
        tenantId : user.tenantId
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    
    const response = NextResponse.json({ 
      status: 200,
      user: { email: user.email, role: user.role, tenantId: user.tenantId }
    });

    response.cookies.set("token", token, {
      httpOnly: true ,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, 
      path: "/",
    });

    return addCors(response)

  } catch (err) {
    console.error("Sign-in error:", err);
     return addCors(
        NextResponse.json({ message: "Invalid credentials" }, { status: 401 })
     );
  }
}
