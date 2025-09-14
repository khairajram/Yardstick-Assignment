import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { addCors, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function POST(req: Request) {
  try {

    const cookieHeader = req.headers.get("cookie");
    if (!cookieHeader) {
      return addCors( NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    }

    const cookies = cookieHeader.split(";");

    const tokenCookie = cookies.find(c => c.trim().startsWith("token="));

    const token = tokenCookie?.split("=")[1];

    if (!token) {
      return addCors( NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    }

    let payload: any;
    try {
      payload = jwt.verify(token ?? "", process.env.JWT_SECRET!);
    } catch {
      return addCors( NextResponse.json({ message: "Invalid token" }, { status: 401 }));
    }

    if (payload.role !== "ADMIN") {
      return addCors( NextResponse.json({ message: "Forbidden: Admins only" }, { status: 403 }));
    }

    console.log(payload.tenantId)

    const { email, password } = await req.json();
    if (!email || !password) {
      return addCors( NextResponse.json({ message: "Missing required fields" }, { status: 400 }));
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return addCors( NextResponse.json({ message: "Email already exists" }, { status: 400 }));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newMember = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "MEMBER",
        tenantId: payload.tenantId, 
      },
    });

    

    return addCors( NextResponse.json({
      id: newMember.id,
      email: newMember.email,
      role: newMember.role,
      tenantId: newMember.tenantId
    }, { status: 201 }));

  } catch (err) {
    console.error("Error creating member:", err);
    return addCors( NextResponse.json({ message: "Internal server error",
      err
     }, { status: 500 }));
  }
}
