import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "./PostFeed";
import { getAuthSession } from "@/lib/auth";

const GeneralFeed = async () => {
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
    orderBy: {
      createdAt: "desc",
    },
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
      comments: true,
      subreadit: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS,
  });
  return <PostFeed initialPosts={posts} />;
};

export default GeneralFeed;
