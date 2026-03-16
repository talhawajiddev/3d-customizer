import { NextRequest, NextResponse } from "next/server";

import { getDesignsByUser } from "@/server/get-designs";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { message: "A userId query parameter is required." },
        { status: 400 }
      );
    }

    const designs = await getDesignsByUser(userId);
    return NextResponse.json({ designs });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load designs.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
