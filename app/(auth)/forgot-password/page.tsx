"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

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

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [touched, setTouched] = React.useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    if (touched) {
      setError(validateEmail(value));
    }
  };

  const handleEmailBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    setTouched(true);
    setError(emailError);

    if (emailError) {
      return;
    }

    // TODO: Implement password recovery API call
    toast.success("E-mail enviado!", {
      description: `Enviamos as instruções de recuperação para ${email}`,
    });
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
            <div className="text-center">
              <h2 className="text-lg font-semibold">Esqueceu sua senha?</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Digite seu e-mail para receber as instruções de recuperação.
              </p>
            </div>

            <Field data-invalid={!!error && touched}>
              <FieldLabel htmlFor="email">E-mail</FieldLabel>
              <FieldContent>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  aria-invalid={!!error && touched}
                  autoComplete="email"
                />
                {error && touched && <FieldError>{error}</FieldError>}
                <FieldDescription>
                  Enviaremos um link para redefinir sua senha.
                </FieldDescription>
              </FieldContent>
            </Field>

            <Button type="submit" className="mt-2 w-full">
              Enviar
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Voltar para o login
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
