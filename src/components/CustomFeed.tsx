import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
  const session = await getAuthSession();

  const followedSubs = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },
    include: {
      subreadit: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      subreadit: {
        name: {
          in: followedSubs.map(({ subreadit }) => subreadit.name),
        },
      },
    },
    include: {
      votes: true,
      author: true,
      subreadit: true,
      comments: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
    orderBy: {
      createdAt: "desc",
    },
  });

  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
