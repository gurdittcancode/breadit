import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { SubreaditSubscriptionValidator } from "@/lib/validators/subreadit";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized!", { status: 401 });
    }

    const body = await req.json();

    const { subreaditId } = SubreaditSubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscription.findFirst({
      where: {
        subreaditId,
        userId: session.user.id,
      },
    });

    if (subscriptionExists) {
      return new Response("You are already subscribed to this subreadit!", {
        status: 400,
      });
    }

    await db.subscription.create({
      data: {
        subreaditId,
        userId: session.user.id,
      },
    });

    return new Response(subreaditId, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid data passed", { status: 422 });
    }

    return new Response("Could not subscribe, please try again later.", {
      status: 500,
    });
  }
}
