import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const existingVote = await db.commentVote.findFirst({
      where: {
        userId: session.user.id,
        commentId,
      },
    });

    const comment = await db.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return new Response("Comment does not exist", { status: 404 });
    }

    if (existingVote) {
      if (existingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              userId: session.user.id,
              commentId,
            },
          },
        });

        return new Response("Ok", { status: 200 });
      }

      // opposite type of vote
      await db.commentVote.update({
        where: {
          userId_commentId: {
            userId: session.user.id,
            commentId,
          },
        },
        data: {
          type: voteType,
        },
      });

      return new Response("Ok", { status: 200 });
    }

    await db.commentVote.create({
      data: {
        type: voteType,
        userId: session.user.id,
        commentId,
      },
    });

    return new Response("Ok", { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid data passed", { status: 422 });
    }

    return new Response("Could not vote, please try again later", {
      status: 500,
    });
  }
}
