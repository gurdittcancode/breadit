import MiniCreatePostButton from "@/components/MiniCreatePostButton";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface IpageProps {
  params: {
    subreaditName: string;
  };
}

const page = async ({ params: { subreaditName } }: IpageProps) => {
  const session = await getAuthSession();

  const subreadit = await db.subreadit.findFirst({
    where: { name: subreaditName },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
          comments: true,
          subreadit: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!subreadit) {
    return notFound();
  }

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl h-14">
        b/{subreadit.name}
      </h1>
      <MiniCreatePostButton session={session} />
      <PostFeed subreaditName={subreadit.name} initialPosts={subreadit.posts} />
    </>
  );
};

export default page;
