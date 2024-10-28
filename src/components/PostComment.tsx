"use client";

import { FC, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { Comment, CommentVote, User } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";

type ExtendedComment = Comment & {
  votes: CommentVote[];
  author: User;
};

interface IPostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote: CommentVote | undefined;
  postId: string;
}

const PostComment: FC<IPostCommentProps> = ({
  comment,
  currentVote,
  postId,
  votesAmt,
}) => {
  const commentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const [isReplying, setIsReplying] = useState<boolean>(false);
  const [reply, setReply] = useState<string>("");
  const { loginToast } = useCustomToast();

  const { mutate: postReply, isLoading } = useMutation({
    mutationFn: async ({ replyToId, text, postId }: CommentRequest) => {
      const payload: CommentRequest = {
        replyToId,
        text,
        postId,
      };

      const { data } = await axios.post("/api/subreadit/post/comment", payload);
      return data;
    },
    onSuccess: () => {
      setIsReplying(false);
      setReply("");
      router.refresh();
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Something went wrong.",
            description: "Couldn't post your reply, please try again later",
            variant: "destructive",
          });
        }
      }

      // @ts-expect-error
      if (err.response?.status === 422) {
        return toast({
          title: "Invalid comment",
          description: "Comment length is too short",
          variant: "destructive",
        });
      }

      // @ts-expect-error
      if (err.response.status === 401) {
        return loginToast();
      }

      toast({
        title: "There was an error",
        description: "Could not create comment.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col" ref={commentRef}>
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name ?? null,
            image: comment.author.image ?? null,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex flex-wrap gap-2 items-center">
        <CommentVotes
          commentId={comment.id}
          initialTotalVotes={votesAmt}
          initialVote={currentVote}
        />

        <Button
          variant="ghost"
          size="xs"
          onClick={() => {
            if (!session?.user) return router.push("/sign-in");
            setIsReplying(true);
          }}
        >
          <MessageSquare className="h-4 w-4 mr-1.5" />
          Reply
        </Button>
      </div>
      {isReplying && (
        <div className="grid w-full gap-1.5">
          <Label htmlFor="comment">Reply</Label>
          <div className="grid w-full gap-1.5">
            <div className="mt-2">
              <Textarea
                id="comment"
                value={reply}
                onChange={(ev) => setReply(ev.target.value)}
                rows={1}
                placeholder="What are your thoughts?"
              />
              <div className="mt-2 flex justify-end">
                <Button
                  className="gap-2"
                  tabIndex={-1}
                  variant="subtle"
                  onClick={() => {
                    setIsReplying(false);
                    setReply("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (!reply) return;
                    postReply({
                      postId,
                      text: reply,
                      replyToId: comment.replyToId ?? comment.id,
                    });
                  }}
                  isLoading={isLoading}
                  disabled={reply.length === 0}
                >
                  Post comment
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostComment;
