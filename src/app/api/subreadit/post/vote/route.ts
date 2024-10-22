import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import type { CachedPost } from "@/types/redis";
import { z } from "zod";

const CACHE_THRESHOLD = 1;
// how many upvotes should a post have to be considered high-engagement

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = PostVoteValidator.parse(body);
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const existingVote = await db.vote.findFirst({
      where: {
        userId: session.user.id,
        postId: postId,
      },
    });

    const post = await db.post.findUnique({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post does not exist", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              userId: session.user.id,
              postId,
            },
          },
        });

        return new Response("OK", { status: 200 });
      }

      await db.vote.update({
        where: {
          userId_postId: {
            userId: session.user.id,
            postId,
          },
        },
        data: {
          type: voteType,
        },
      });

      // if this post has a lot of upvotes, cache it
      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UP") return acc + 1;
        if (vote.type === "DOWN") return acc - 1;
        return acc;
      }, 0);

      if (votesAmt >= CACHE_THRESHOLD) {
        const cachePayload: CachedPost = {
          authorUsername: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          createdAt: post.createdAt,
          currentVote: voteType,
        };

        await redis.hset(`post:${postId}`, cachePayload);
      }

      return new Response("OK", { status: 200 });
    }

    await db.vote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        postId,
      },
    });

    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UP") return acc + 1;
      if (vote.type === "DOWN") return acc - 1;
      return acc;
    }, 0);

    if (votesAmt >= CACHE_THRESHOLD) {
      const cachePayload: CachedPost = {
        authorUsername: post.author.username ?? "",
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        currentVote: voteType,
      };

      await redis.hset(`post:${postId}`, cachePayload);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid data passed", { status: 422 });
    }

    return new Response("Could not vote, please try again later", {
      status: 500,
    });
  }
}
