import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { saveDesign } from "@/server/save-design";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const design = await saveDesign(body);

    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid design payload.", issues: error.flatten() },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Unable to save design.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
