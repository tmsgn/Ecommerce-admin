import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Authenticate the user
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Parse the request body for all new fields
    const body = await req.json();
    const { name, description } = body;

    // 3. Validate required fields
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // 4. Generate a URL-friendly slug from the store name
    // This replaces spaces with hyphens and removes special characters
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '');
    
    // Note: For a production app, you might add logic here to check if the
    // slug is already taken and append a unique identifier if it is.

    // 5. Create the store in the database with all the new data
    const store = await prismadb.store.create({
      data: {
        name,
        description, // Add the description
        slug,        // Add the generated slug
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error: any) {
    // Log the error for debugging
    console.error("[STORES_POST_API]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}