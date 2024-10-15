import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { subreaditValidator } from "@/lib/validators/subreadit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = subreaditValidator.parse(body);

    // check if subreadit already exists
    const subreaditExists = await db.subreadit.findFirst({
      where: {
        name,
      },
    });

    if (subreaditExists) {
      return new Response("Subreadit already exists", { status: 409 });
    }

    // create new subreadit
    const subreadit = await db.subreadit.create({
      data: {
        name,
        creatorId: session.user.id,
      },
    });

    // subscribe user to their own subreadit
    await db.subscription.create({
      data: {
        userId: session.user.id,
        subreaditId: subreadit.id,
      },
    });

    return new Response(subreadit.name, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 422 });
    }

    return new Response("Could not create subreadit", { status: 500 });
  }
}
