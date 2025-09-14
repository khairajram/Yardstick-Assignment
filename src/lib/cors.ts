import { NextResponse } from "next/server";
const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || "*";


export function addCors(response: NextResponse, methods: string[] = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]) {
  response.headers.set("Access-Control-Allow-Origin", FRONTEND_URL); 
  response.headers.set("Access-Control-Allow-Methods", methods.join(","));
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  response.headers.set("Access-Control-Allow-Credentials", "true");
  return response;
}

export function handleOptions(req: Request) {
  if (req.method === "OPTIONS") {
    const response = NextResponse.json({});
    return addCors(response);
  }
  return null;
}
