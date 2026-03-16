import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { submitRequest } from "@/server/submit-request";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await submitRequest(body);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid request payload.", issues: error.flatten() },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to submit request.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
