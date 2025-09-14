import { NextRequest,NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addCors, handleOptions } from "@/lib/cors";

export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { tenantId } = getUserFromRequest(req);

    const note = await prisma.note.findUnique({ where: { id: params.id } });

    if (!note || note.tenantId !== tenantId) {
      return addCors(NextResponse.json({ message: "Note not found" }, { status: 404 }))
    }

    return addCors( NextResponse.json(note))

  } catch (err: any) {
    console.error(err);
    return addCors( NextResponse.json({ message: err.message || "Internal server error" }, { status: err.status || 500 }))
  }
}



export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, tenantId } = getUserFromRequest(req);
    const { title, content } = await req.json();

    const note = await prisma.note.findUnique({ where: { id: params.id } });

    if (!note || note.tenantId !== tenantId) {
      return addCors( NextResponse.json({ message: "Note not found" }, { status: 404 }))
    }

    if (note.authorId !== userId) {
      return addCors( NextResponse.json({ message: "Forbidden: Cannot edit others' notes" }, { status: 403 }))
    }

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: { title, content }
    });

    return addCors( NextResponse.json(updatedNote))

  } catch (err: any) {
    console.error(err);
    return addCors( NextResponse.json({ message: err.message || "Internal server error" }, { status: err.status || 500 }))
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId, tenantId, role } = getUserFromRequest(req);

    const note = await prisma.note.findUnique({ where: { id: params.id } });

    if (!note || note.tenantId !== tenantId) {
      return addCors( NextResponse.json({ message: "Note not found" }, { status: 404 }))
    }

    if (note.authorId !== userId && role !== "ADMIN") {
      return addCors( NextResponse.json({ message: "Forbidden: Cannot delete others' notes" }, { status: 403 }))
    }

    await prisma.note.delete({ where: { id: params.id } });

    return addCors( NextResponse.json({ message: "Note deleted" }))

  } catch (err: any) {
    console.error(err);
    return addCors( NextResponse.json({ message: err.message || "Internal server error" }, { status: err.status || 500 }))
  }
}



