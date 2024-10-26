"use client";

import { FC, useState } from "react";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

interface ICreateCommentProps {
  postId: string;
  replyToId?: string;
}

const CreateComment: FC<ICreateCommentProps> = ({ postId, replyToId }) => {
  const [comment, setComment] = useState<string>("");

  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: postComment, isLoading } = useMutation({
    mutationFn: async ({ postId, replyToId, text }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replyToId,
      };
      const { data } = await axios.post(`/api/subreadit/post/comment`, payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Subreadit already exists!",
            description: "Please choose a different subreadit name.",
            variant: "destructive",
          });
        }
      }

      if (err.response?.status === 422) {
        return toast({
          title: "Invalid comment",
          description: "Comment length is too short",
          variant: "destructive",
        });
      }

      if (err.response.status === 401) {
        return loginToast();
      }

      toast({
        title: "There was an error",
        description: "Could not create comment.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      router.refresh();
      setComment("");
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Post a comment</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={comment}
          onChange={(ev) => setComment(ev.target.value)}
          rows={1}
          placeholder="What are your thoughts?"
        />
        <div className="mt-2 flex justify-end">
          <Button
            onClick={() =>
              postComment({
                postId,
                text: comment,
                replyToId,
              })
            }
            isLoading={isLoading}
            disabled={comment.length === 0}
          >
            Post comment
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
