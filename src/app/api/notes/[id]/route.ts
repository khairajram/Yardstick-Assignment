import { NextRequest,NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addCors, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}


function extractIdFromReq(req: Request) {
  const url = new URL(req.url);
  const segments = url.pathname.split("/");
  return segments[segments.length - 1];
}

export async function GET(req: NextRequest) {
  try {
    const { tenantId } = getUserFromRequest(req);

     const id = extractIdFromReq(req)

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.tenantId !== tenantId) {
      return addCors(NextResponse.json({ message: "Note not found" }, { status: 404 }))
    }

    return addCors( NextResponse.json(note))

  } catch (err: any) {
    console.error(err);
    return addCors( NextResponse.json({ message: err.message || "Internal server error" }, { status: err.status || 500 }))
  }
}



export async function PUT(req: NextRequest) {
  try {
    const { userId, tenantId } = getUserFromRequest(req);
    const { title, content } = await req.json();

     const id = extractIdFromReq(req)

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.tenantId !== tenantId) {
      return addCors( NextResponse.json({ message: "Note not found" }, { status: 404 }))
    }

    if (note.authorId !== userId) {
      return addCors( NextResponse.json({ message: "Forbidden: Cannot edit others' notes" }, { status: 403 }))
    }

    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, content }
    });

    return addCors( NextResponse.json(updatedNote))

  } catch (err: any) {
    console.error(err);
    return addCors( NextResponse.json({ message: err.message || "Internal server error" }, { status: err.status || 500 }))
  }
}


export async function DELETE(req: NextRequest) {
  try {
    const { userId, tenantId, role } = getUserFromRequest(req);

     const id = extractIdFromReq(req)

    const note = await prisma.note.findUnique({ where: { id } });

    if (!note || note.tenantId !== tenantId) {
      return addCors( NextResponse.json({ message: "Note not found" }, { status: 404 }))
    }

    if (note.authorId !== userId && role !== "ADMIN") {
      return addCors( NextResponse.json({ message: "Forbidden: Cannot delete others' notes" }, { status: 403 }))
    }

    await prisma.note.delete({ where: { id } });

    return addCors( NextResponse.json({ message: "Note deleted" }))

  } catch (err: any) {
    console.error(err);
    return addCors( NextResponse.json({ message: err.message || "Internal server error" }, { status: err.status || 500 }))
  }
}



