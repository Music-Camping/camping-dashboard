"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface LoginResult {
  success: boolean;
  error?: string;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResult> {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        error:
          (data as { detail?: string }).detail ||
          "Credenciais invalidas. Tente novamente.",
      };
    }

    const data = (await response.json()) as {
      access_token: string;
      expires_in: number;
    };

    const cookieStore = await cookies();
    cookieStore.set("access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: data.expires_in,
    });

    return { success: true };
  } catch {
    return {
      success: false,
      error: "Erro de conexao. Verifique se o servidor esta rodando.",
    };
  }
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  redirect("/login");
}
