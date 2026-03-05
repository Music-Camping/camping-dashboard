import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = await fetch(`${process.env.API_URL}/auth/tv/init`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { detail: "Erro ao inicializar sessão na TV" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { detail: "Erro de conexão com o servidor" },
      { status: 500 },
    );
  }
}
