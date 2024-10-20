import { Comment, Post, Subreadit, User, Vote } from "@prisma/client";

export type ExtendedPost = Post & {
  subreadit: Subreadit;
  votes: Vote[];
  author: User;
  comments: Comment[];
};
