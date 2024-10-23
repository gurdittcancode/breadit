"use client";

import { ExtendedPost } from "@/types/db";
import { FC, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { useSession } from "next-auth/react";
import Post from "./Post";

interface IPostFeedProps {
  initialPosts: ExtendedPost[];
  subreaditName?: string;
}

const PostFeed: FC<IPostFeedProps> = ({ initialPosts, subreaditName }) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { data: session } = useSession();

  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data, fetchNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async function ({ pageParam = 1 }) {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subreaditName ? `&subreaditName=${subreaditName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: {
        pages: [initialPosts],
        pageParams: [1],
      },
    },
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, idx) => {
        const totalVotes = post.votes.reduce((acc, vote) => {
          if (vote.type === "UP") return acc + 1;
          if (vote.type === "DOWN") return acc - 1;
          return acc;
        }, 0);

        const userHasVoted = post.votes.find(
          (vote) => vote.userId === session?.user.id,
        );

        if (idx === posts.length - 1) {
          return (
            <li key={post.id} ref={ref}>
              <Post
                totalVotes={totalVotes}
                currentVote={userHasVoted}
                totalComments={post.comments.length}
                post={post}
                subreaditName={post.subreadit.name}
              />
            </li>
          );
        }

        return (
          <Post
            totalComments={post.comments.length}
            totalVotes={totalVotes}
            currentVote={userHasVoted}
            key={post.id}
            post={post}
            subreaditName={post.subreadit.name}
          />
        );
      })}
    </ul>
  );
};

export default PostFeed;
