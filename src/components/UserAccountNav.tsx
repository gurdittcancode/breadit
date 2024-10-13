import { User } from "next-auth";
import { FC } from "react";

interface IUserAccountProps {
  user: Pick<User, "name" | "image" | "email">;
}

const UserAccountNav: FC<IUserAccountProps> = ({}) => {
  return <div>UserAccountNav</div>;
};

export default UserAccountNav;
