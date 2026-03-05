import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId } = body;

    if (!deviceId) {
      return NextResponse.json(
        { detail: "deviceId é obrigatório" },
        { status: 400 },
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
      return NextResponse.json(
        { detail: "Usuário não autenticado" },
        { status: 401 },
      );
    }

    const response = await fetch(`${process.env.API_URL}/auth/tv/authorize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ device_id: deviceId }),
    });

    if (!response.ok) {
      const respData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { detail: respData.detail || "Erro ao autorizar TV" },
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
