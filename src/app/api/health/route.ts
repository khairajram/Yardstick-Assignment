import { NextResponse } from "next/server";
import { addCors, handleOptions } from "@/lib/cors";

export async function GET() {
  const response = NextResponse.json({ status: "ok" });

  return addCors(response);
}


export async function OPTIONS(req: Request) {
  return handleOptions(req);
}
