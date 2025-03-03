import { useLoginUser } from "~/api/mutations/useLoginUser";
import type { Route } from "./+types/Login";
import { Button } from "~/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { LoginBody } from "~/api/generated-api";
import { Link, useNavigate } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Login" }, { name: "description", content: "Login" }];
}

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(1, { message: "Password is required" }),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const { mutateAsync: loginUser } = useLoginUser();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<LoginBody>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginBody) => {
    loginUser({ data }).then(() => {
      navigate("/");
    });
  };

  return (
    <div>
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle role="heading" className="text-2xl">
            Zaloguj się
          </CardTitle>
          <CardDescription>Wprowadź swoje dane, aby uzyskać dostęp do konta</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Adres e-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="nazwa@przykład.pl"
                className={cn({ "border-red-500": errors.email })}
                {...register("email")}
              />
              {errors.email && <div className="text-sm text-red-500">{errors.email.message}</div>}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Hasło</Label>
                <Link
                  to="/auth/password-recovery"
                  className="ml-auto inline-block text-sm underline"
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
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
            <Controller
              control={control}
              name="rememberMe"
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <Label
                    htmlFor="rememberMe"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Zapamiętaj mnie
                  </Label>
                </div>
              )}
            />
            <Button type="submit" className="w-full">
              Zaloguj się
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Nie masz jeszcze konta?{" "}
            <Link to="/auth/register" className="underline">
              Zarejestruj się
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
