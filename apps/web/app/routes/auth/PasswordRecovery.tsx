import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { Route } from "../+types/PasswordRecovery";
import { useForgotPassword } from "~/api/mutations/useForgotPassword";
import type { ForgotPasswordBody } from "~/api/generated-api";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
});

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Password Recovery" },
    { name: "description", content: "Recover access to your account" },
  ];
}

export default function PasswordRecovery() {
  const navigate = useNavigate();
  const [emailSent, setEmailSent] = useState(false);
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordBody>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordBody) => {
    await forgotPassword({ data });
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle role="heading" className="text-2xl">
              Email sent
            </CardTitle>
            <CardDescription>
              Password reset instructions have been sent to {getValues("email")}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-gray-500">
              Check your inbox and click the link to reset your password. If you don't receive an
              email within a few minutes, please check your spam folder.
            </p>
            <Button className="w-full" onClick={() => navigate("/login")}>
              Return to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle role="heading" className="text-2xl">
            Password Recovery
          </CardTitle>
          <CardDescription>Enter your email to receive a password reset link</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className={cn({ "border-red-500": errors.email })}
                {...register("email")}
              />
              {errors.email && <div className="text-sm text-red-500">{errors.email.message}</div>}
            </div>
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Sending..." : "Send reset link"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-sm underline">
              Return to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
