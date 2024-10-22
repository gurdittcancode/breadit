import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const session = await getAuthSession();

  let followedSubsIds: string[] = [];

  if (session) {
    const followedSubs = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subreadit: true,
      },
    });

    followedSubsIds = followedSubs.map(({ subreadit }) => subreadit.id);

    try {
      const { limit, page, subreaditName } = z
        .object({
          limit: z.string(),
          page: z.string(),
          subreaditName: z.string().nullish().optional(),
        })
        .parse({
          subreaditName: url.searchParams.get("subreaditName"),
          limit: url.searchParams.get("limit"),
          page: url.searchParams.get("page"),
        });

      let whereClause = {};

      if (subreaditName) {
        whereClause = {
          subreadit: {
            name: subreaditName,
          },
        };
      } else if (session) {
        whereClause = {
          subreadit: {
            id: {
              in: followedSubsIds,
            },
          },
        };
      }

      const posts = await db.post.findMany({
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        orderBy: {
          createdAt: "desc",
        },
        include: {
          subreadit: true,
          votes: true,
          author: true,
          comments: true,
        },
        where: whereClause,
      });

      return new Response(JSON.stringify(posts), { status: 200 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return new Response("Invalid request data passed", { status: 422 });
      }

      return new Response(
        "Could not fetch more posts, please try again later.",
        {
          status: 500,
        },
      );
    }
  }
}
