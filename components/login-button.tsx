"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button, ButtonProps } from "@/components/ui/button";
import { forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface LoginButtonProps extends ButtonProps {
  asChild?: boolean;
}

export const LoginButton = forwardRef<HTMLButtonElement, LoginButtonProps>(
  ({ asChild, ...props }, ref) => {
    const { data: session, status } = useSession();
    const isLoading = status === "loading";

    if (isLoading) {
      return (
        <Button disabled variant="outline" {...props} ref={ref}>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </Button>
      );
    }

    if (session) {
      return (
        <Button
          variant="outline"
          onClick={() => signOut()}
          {...props}
          ref={ref}
        >
          Sign Out
        </Button>
      );
    }

    return (
      <Button
        onClick={() => signIn("google")}
        {...props}
        ref={ref}
      >
        Sign In
      </Button>
    );
  }
);

LoginButton.displayName = "LoginButton";