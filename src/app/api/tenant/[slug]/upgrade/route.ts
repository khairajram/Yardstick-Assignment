import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
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

    const isThere = await prisma.tenant.findUnique({ 
      where: { id : payload.tenantId }
    });

    if (!isThere) {
      return addCors( NextResponse.json({ message: "No tenant is there" }, { status: 400 }));
    }

    const upgrade = await prisma.tenant.update({ 
      where: { id : payload.tenantId },
      data : {
        subscription : "PRO"
      }
    });

    

    return addCors( NextResponse.json({
      id: upgrade.id,
      slug: upgrade.slug,
      subscription: upgrade.subscription
    }, { status: 200 }));

  } catch (err) {
    console.error("Error updating subscription:", err);
    return addCors( NextResponse.json({ message: "Internal server error",
      err
     }, { status: 500 }));
  }
}
