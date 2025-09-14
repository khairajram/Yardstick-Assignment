import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { addCors, handleOptions } from "@/lib/cors";
import { getUserFromRequest } from "@/lib/auth";


export async function OPTIONS(req: Request) {
  return handleOptions(req);
}

export async function POST(req: Request) {
  const { name, slug, email, password } = await req.json();

  if (!name || !slug || !email || !password) {
    return addCors( NextResponse.json({ message: "Missing required fields" }, { status: 400 }));
  }

  try {
    const existingTenant = await prisma.tenant.findUnique({ where : { slug } });
    if (existingTenant) {
      return addCors( NextResponse.json({ message: "Tenant slug already exists" }, { status: 400 }))
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return addCors( NextResponse.json({ message: "Email already exists" }, { status: 400 }))
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    

    const result = await prisma.$transaction(async (tx) => {

    const newTenant = await tx.tenant.create({ data: { name, slug } });
    const newAdmin = await tx.user.create({
      data: { email, password: hashedPassword, role: "ADMIN", tenantId: newTenant.id }
    });
    
    return { newTenant, newAdmin };
  });

  return addCors( NextResponse.json({
    id: result.newAdmin.id,
    email: result.newAdmin.email,
    role: result.newAdmin.role,
    tenantId: result.newAdmin.tenantId
  }, { status: 201 }))

  } catch (err) {
    console.error("Error creating tenant + admin:", err);
    return addCors( NextResponse.json({ message: "Internal server error" }, { status: 500 }))
  }
}

export async function PUT(req: Request) {
  const { tenantId } = getUserFromRequest(req);

  if (!tenantId) {
    return addCors(
      NextResponse.json({ message: "Missing tenantId" }, { status: 400 })
    );
  }

  try {
    const existingTenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { users: true },
    });

    if (!existingTenant) {
      return addCors(
        NextResponse.json({ message: "Tenant not found" }, { status: 404 })
      );
    }


        const  updatedAdmin = await prisma.tenant.update({
            where: { id: tenantId },
            data: {
              subscription : "PRO"
            },
          });


    return addCors(
      NextResponse.json(
        {
          "message" : "updated"
        },
        { status: 200 }
      )
    );
  } catch (err) {
    console.error("Error updating tenant + admin:", err);
    return addCors(
      NextResponse.json({ message: "Internal server error" }, { status: 500 })
    );
  }
}
