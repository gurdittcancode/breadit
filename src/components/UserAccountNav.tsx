"use client";

import { User } from "next-auth";
import { FC } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface IUserAccountProps {
  user: Pick<User, "name" | "image" | "email">;
}

const UserAccountNav: FC<IUserAccountProps> = ({ user }) => {
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <UserAvatar
            className="h-8 w-8"
            user={{
              name: user.name || null,
              image: user.image || null,
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white" align="end">
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-2 leading-none">
              {user.name && <p className="font-medium">{user.name}</p>}
              {user.email && (
                <p className="w-[200px] truncate text-sm text-zinc-700">
                  {user.email}
                </p>
              )}
            </div>
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem asChild>
            <Link href="/">Feed</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/b/create">Create community</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={(evt) => {
              evt.preventDefault();
              signOut({
                callbackUrl: `${window.location.origin}/sign-in`,
              });
            }}
            className="cursor-pointer"
          >
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAccountNav;
