import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { PostValidator } from "@/lib/validators/post";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized!", { status: 401 });
    }

    const body = await req.json();

    const { subreaditId, title, content } = PostValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subreaditId,
        userId: session.user.id,
      },
    });

    if (!subscriptionExists) {
      return new Response("Subscribe to post", {
        status: 400,
      });
    }

    await db.post.create({
      data: {
        title,
        subreaditId,
        content,
        authorId: session.user.id,
      },
    });

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid data passed", { status: 422 });
    }

    return new Response("Could not create post", {
      status: 500,
    });
  }
}
