import jwt from "jsonwebtoken";



export function getUserFromRequest(req: Request) {
  const cookieHeader = req.headers.get("cookie");
  
  if (!cookieHeader) throw { status: 401, message: "Unauthorized" };

  const tokenCookie = cookieHeader.split(";").find(c => c.trim().startsWith("token="));
  if (!tokenCookie) throw { status: 401, message: "Unauthorized" };

  const token = tokenCookie.split("=")[1];
  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!);
    return payload;
  } catch {
    throw { status: 401, message: "Invalid token" };
  }
}