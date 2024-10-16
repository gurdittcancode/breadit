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

    if (!subscriptionExists) {
      return new Response("You are not subscribed to this subreadit!", {
        status: 400,
      });
    }

    // check if user is creator of subreadit
    const subreadit = await db.subreadit.findFirst({
      where: {
        id: subreaditId,
        creatorId: session.user.id,
      },
    });

    if (subreadit) {
      return new Response("You can't leave a subreadit that you created", {
        status: 400,
      });
    }

    await db.subscription.delete({
      where: {
        userId_subreaditId: {
          userId: session.user.id,
          subreaditId,
        },
      },
    });

    return new Response(subreaditId, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid data passed", { status: 422 });
    }

    return new Response("Could not unsubscribe, please try again later.", {
      status: 500,
    });
  }
}
