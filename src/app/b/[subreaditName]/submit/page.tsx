import Editor from "@/components/Editor";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface IpageProps {
  params: {
    subreaditName: string;
  };
}

const page = async ({ params: { subreaditName } }: IpageProps) => {
  const subreadit = await db.subreadit.findFirst({
    where: {
      name: subreaditName,
    },
  });

  if (!subreadit) return notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-base font-semibold leading-6 text-gray-900">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-gray-500">
            in r/{subreaditName}
          </p>
        </div>
      </div>

      <Editor subreaditId={subreadit.id} />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form="subreadit-post-form">
          Post
        </Button>
      </div>
    </div>
  );
};

export default page;
