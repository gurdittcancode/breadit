import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface ICommentsSectionProps {
  postId: string;
}

const CommentsSection = async ({ postId }: ICommentsSectionProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
      // only fetch parent comments
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />

      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((cmt) => !cmt.replyToId)
          .map((topLevelCmt) => {
            const votes = topLevelCmt.votes.reduce((acc, vote) => {
              if (vote.type === "UP") return acc + 1;
              if (vote.type === "DOWN") return acc - 1;
              return acc;
            }, 0);

            const userCmtVote = topLevelCmt.votes.find(
              (vote) => vote.userId === session?.user.id,
            );

            return (
              <div key={topLevelCmt.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    comment={topLevelCmt}
                    currentVote={userCmtVote}
                    postId={postId}
                    votesAmt={votes}
                  />
                </div>

                {topLevelCmt.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVotes = reply.votes.reduce((acc, vote) => {
                      if (vote.type === "UP") return acc + 1;
                      if (vote.type === "DOWN") return acc - 1;
                      return acc;
                    }, 0);

                    const userRplVote = topLevelCmt.votes.find(
                      (vote) => vote.userId === session?.user.id,
                    );
                    return (
                      <div
                        key={reply.id}
                        className="ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                      >
                        <PostComment
                          comment={reply}
                          currentVote={userRplVote}
                          postId={postId}
                          votesAmt={replyVotes}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;
