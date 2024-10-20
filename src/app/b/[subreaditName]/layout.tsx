import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import SubscribeOrLeaveToggle from "@/components/SubscribeOrLeaveToggle";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";

const Layout = async ({
  children,
  params: { subreaditName },
}: {
  children: React.ReactNode;
  params: { subreaditName: string };
}) => {
  const session = await getAuthSession();

  const subreadit = await db.subreadit.findFirst({
    where: { name: subreaditName },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  const subscription = !session?.user
    ? undefined
    : await db.subscription.findFirst({
        where: {
          subreadit: {
            name: subreaditName,
          },
          user: {
            id: session.user.id,
          },
        },
      });

  const isSubscribed = !!subscription;

  if (!subreadit) return notFound();

  const memberCount = await db.subscription.count({
    where: {
      subreadit: {
        name: subreaditName,
      },
    },
  });

  return (
    <div className="sm:container max-w-7xl mx-auto h-full pt-12">
      <div>
        {/* TODO: Button to take us back*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          {/* info sidebar */}
          <div className="hidden md:block overflow-hidden h-fit rounded-lg border border-gray-200 order-first md:order-last">
            <div className="px-6 py-4 ">
              <p className="font-semibold py-4">About r/{subreaditName}</p>
            </div>

            <dl className="divide-y divide-gray-100 px-6 py-4 text-sm leading-6 bg-white">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500 ">Created</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreadit.createdAt.toDateString()}>
                    {format(subreadit.createdAt, "d MMMM, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500 ">Members</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-900">{memberCount}</div>
                </dd>
              </div>

              {subreadit.creatorId === session?.user.id && (
                <div className="flex justify-between gap-x-4 py-3 ">
                  <p className="text-gray-500">You created this community!</p>
                </div>
              )}

              {subreadit.creatorId !== session?.user.id && (
                <SubscribeOrLeaveToggle
                  subreaditId={subreadit.id}
                  isSubscribed={isSubscribed}
                  subreaditName={subreadit.name}
                />
              )}

              <Link
                className={buttonVariants({
                  variant: "outline",
                  className: "w-full mb-6",
                })}
                href={`b/${subreaditName}/submit`}
              >
                Create Post
              </Link>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
