import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import type { CreatePasswordBody } from "~/api/generated-api";
import { cn } from "~/lib/utils";
import type { Route } from "../+types/CreateNewPassword";
import { useCreatePassword, useResetPassword } from "~/api/mutations/useCreatePassword";

const createPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .max(64, { message: "Password cannot exceed 64 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

type CreatePasswordFormValues = z.infer<typeof createPasswordSchema>;

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Create Password" },
    { name: "description", content: "Complete your account registration by creating a password" },
  ];
}

export default function CreateNewPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { mutateAsync: createPassword } = useCreatePassword();
  const { mutateAsync: resetPassword } = useResetPassword();

  const createToken = searchParams.get("createToken");
  const resetToken = searchParams.get("resetToken");
  const email = searchParams.get("email");

  const token = createToken || resetToken;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePasswordFormValues>({
    resolver: zodResolver(createPasswordSchema),
  });

  const onSubmit = async (data: CreatePasswordFormValues) => {
    if (!token || !email) {
      toast.error("Missing required parameters in URL");
      return;
    }

    setIsSubmitting(true);

    try {
      if (createToken) {
        
        await createPassword({
          data: {
            password: data.password,
            createToken,
          },
        });
      } else if (resetToken) {
        
        await resetPassword({
          data: {
            newPassword: data.password,
            resetToken,
          },
        });
      }

      navigate("/login");
    } catch (error) {
      
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!token || !email) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="mx-auto max-w-sm">
          <CardHeader>
            <CardTitle role="heading" className="text-2xl">
              Błąd
            </CardTitle>
            <CardDescription>Nieprawidłowy link aktywacyjny</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              Link, który próbujesz otworzyć, jest nieprawidłowy lub wygasł. Skontaktuj się z
              administratorem w celu uzyskania nowego linku aktywacyjnego.
            </p>
            <Button className="mt-4 w-full" onClick={() => navigate("/login")}>
              Przejdź do logowania
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
            {createToken ? "Utwórz hasło" : "Zresetuj hasło"}
          </CardTitle>
          <CardDescription>
            {createToken
              ? "Utwórz hasło, aby dokończyć rejestrację konta"
              : "Utwórz nowe hasło do swojego konta"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input id="email" type="email" value={email || ""} disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                className={cn({ "border-red-500": errors.password })}
                {...register("password")}
              />
              {errors.password && (
                <div className="text-sm text-red-500">{errors.password.message}</div>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
              <Input
                id="confirmPassword"
                type="password"
                className={cn({ "border-red-500": errors.confirmPassword })}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <div className="text-sm text-red-500">{errors.confirmPassword.message}</div>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Przetwarzanie..." : "Zapisz hasło"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
