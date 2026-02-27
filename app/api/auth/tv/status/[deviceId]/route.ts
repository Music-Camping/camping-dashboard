import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ deviceId: string }> },
) {
  try {
    const { deviceId } = await params;

    if (!deviceId) {
      return NextResponse.json(
        { detail: "deviceId é obrigatório" },
        { status: 400 },
      );
    }

    const response = await fetch(
      `${process.env.API_URL}/auth/tv/status/${deviceId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { detail: "Erro ao checar status" },
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
