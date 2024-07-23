import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // defaults to auto
import type { NextApiRequest, NextApiResponse } from "next";

type ResponseData = {
  message: string;
};

export async function GET(
  req: Request,
) {
    

  return Response.json({ message: "Hello from Next.js!" });
}
