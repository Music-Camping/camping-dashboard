"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email) {
    return "Insira um e-mail válido";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Insira um e-mail válido";
  }
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) {
    return "A senha deve ter pelo menos 6 caracteres";
  }
  if (password.length < 6) {
    return "A senha deve ter pelo menos 6 caracteres";
  }
  return undefined;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [touched, setTouched] = React.useState<{
    email: boolean;
    password: boolean;
  }>({
    email: false,
    password: false,
  });

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setPassword(value);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call - replace with actual authentication logic
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate success for demo purposes
          // In production, this would be an actual API call
          if (email && password) {
            resolve({ success: true });
          } else {
            reject(new Error("Credenciais inválidas"));
          }
        }, 1500);
      });

      // Store remember me preference if needed
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }

      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao fazer login. Tente novamente.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center space-y-4 pb-2">
          <Image
            src="/camping.png"
            alt="Camping Logo"
            width={64}
            height={64}
            className="rounded-lg"
            priority
          />
          <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-extrabold tracking-wide">
            CAMPING
          </h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Field data-invalid={!!errors.email && touched.email}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  aria-invalid={!!errors.email && touched.email}
                  disabled={isLoading}
                  autoComplete="email"
                />
                {errors.email && touched.email && (
                  <FieldError>{errors.email}</FieldError>
                )}
              </FieldContent>
            </Field>

            <Field data-invalid={!!errors.password && touched.password}>
              <FieldLabel htmlFor="password">Senha</FieldLabel>
              <FieldContent>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  aria-invalid={!!errors.password && touched.password}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                {errors.password && touched.password && (
                  <FieldError>{errors.password}</FieldError>
                )}
              </FieldContent>
            </Field>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="remember"
                  className="cursor-pointer text-sm font-normal"
                >
                  Lembrar de mim
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>

            <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
