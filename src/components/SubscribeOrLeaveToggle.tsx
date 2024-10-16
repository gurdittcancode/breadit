"use client";

import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { SubscribeToSubreaditPayload } from "@/lib/validators/subreadit";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { useRouter } from "next/navigation";

interface ISubscribeLeaveToggle {
  subreaditId: string;
  isSubscribed: boolean;
  subreaditName: string;
}

const SubscribeOrLeaveToggle: FC<ISubscribeLeaveToggle> = ({
  subreaditId,
  isSubscribed,
  subreaditName,
}) => {
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: joinSubreadit, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubreaditPayload = {
        subreaditId,
      };
      const { data } = await axios.post("/api/subreadit/subscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }

        return toast({
          title: "Something went wrong...",
          description: "There was a problem, please try again later",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Subscribed!",
        description: `You are now subscribed to b/${subreaditName}`,
      });
    },
  });

  const { mutate: leaveSubreadit, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubreaditPayload = {
        subreaditId,
      };
      const { data } = await axios.post("/api/subreadit/unsubscribe", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }

        return toast({
          title: "Something went wrong...",
          description: "There was a problem, please try again later",
          variant: "destructive",
        });
      }
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      return toast({
        title: "Unsubscribed!",
        description: `You have successfully unsubscribed from b/${subreaditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button
      isLoading={isUnsubLoading}
      onClick={() => leaveSubreadit()}
      className="w-full mt-1 mb-4"
    >
      Leave community
    </Button>
  ) : (
    <Button
      onClick={() => joinSubreadit()}
      isLoading={isSubLoading}
      className="w-full mt-1 mb-4"
    >
      Join to post
    </Button>
  );
};

export default SubscribeOrLeaveToggle;
