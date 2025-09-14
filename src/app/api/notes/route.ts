import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { addCors, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function POST(req: Request) {
  try {
    const { userId, tenantId } = getUserFromRequest(req);

    const body = await req.json();
    const { title, content } = body;

    if (!title) return addCors(
      NextResponse.json({ message: "Title required" }, { status: 400 })
    )

    
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) return addCors(
      NextResponse.json({ message: "Tenant not found" }, { status: 400 })
    );

    if (tenant.subscription === "FREE") {
      const noteCount = await prisma.note.count({ where: { tenantId } });
      if (noteCount >= 3) {
        return addCors(
          NextResponse.json({ message: "Free plan limit reached" }, { status: 403 })
        );
      }
    }

    const newNote = await prisma.note.create({
      data: {
        title,
        content,
        tenantId,
        authorId: userId
      }
    });

    return addCors(NextResponse.json(newNote, { status: 201 }));

  } catch (err: any) {
    console.error(err);
    return addCors(
      NextResponse.json({ message: err.message || "Internal server error" }, { status: err.status || 500 })
    );
  }
}


export async function GET(req: Request) {
  try {
    const { tenantId,userId,role } = getUserFromRequest(req);

    const notes = await prisma.note.findMany({
      where: { tenantId },
      select : {
        id : true,
        title : true,
        content : true,
        tenant : {
          select : {
            subscription : true
          }
        }
      }
    });
    

    const subscription = notes[0]?.tenant?.subscription || ""


    return addCors( NextResponse.json({notes,role,subscription }) )

  } catch (err: any) {
    console.error(err);
    return addCors(
      NextResponse.json({ message: err.message || "Internal server error",err }, { status: err.status || 500 })
    )
  }
}


