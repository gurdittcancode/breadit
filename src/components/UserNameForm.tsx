"use client";

import { UsernameRequest, UsernameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface IUserNameFormProps {
  user: Pick<User, "id" | "username">;
}

const UserNameForm = ({ user }: IUserNameFormProps) => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UsernameRequest>({
    resolver: zodResolver(UsernameValidator),
    defaultValues: {
      name: user?.username ?? "",
    },
  });

  const router = useRouter();

  const { mutate: changeUsername, isLoading } = useMutation({
    mutationFn: async ({ name }: UsernameRequest) => {
      const payload: UsernameRequest = { name };
      const { data } = await axios.patch(`/api/username`, payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken",
            description: "Please choose a different username",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "There was an error",
        description: "Could not create comment.",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        description: "Username successfully updated :)",
      });
      router.refresh();
    },
  });

  return (
    <form onSubmit={handleSubmit((ev) => changeUsername(ev))}>
      <Card>
        <CardHeader>
          <CardTitle>Your new username</CardTitle>
          <CardDescription>
            Please enter a display name that you like.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-500">u/</span>
            </div>
            <Label className="sr-only" htmlFor="name">
              Name
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            />

            {errors.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isLoading={isLoading}>Change username</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserNameForm;
