"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";
import useSWR from "swr";
import { Loader2, Tv } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

const POLLING_INTERVAL = 3000; // 3 seconds

interface TVInitResponse {
  device_id: string;
}

interface TVStatusResponse {
  status: string;
  tokens?: {
    access_token: string;
    expires_in: number;
  };
}

export default function TVLoginPage() {
  const router = useRouter();
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetcher = (url: string) =>
    fetch(url).then((res) => {
      if (!res.ok) throw new Error("Erro na requisição");
      return res.json();
    });

  // Polling via SWR only if deviceId is set
  const { data: statusData, error: statusError } = useSWR<TVStatusResponse>(
    deviceId ? `/api/auth/tv/status/${deviceId}` : null,
    fetcher,
    { refreshInterval: POLLING_INTERVAL },
  );

  const initSession = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/tv/init", { method: "POST" });
      if (!res.ok) {
        throw new Error("Erro ao gerar sessão");
      }
      const data: TVInitResponse = await res.json();
      setDeviceId(data.device_id);
    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initSession();
  }, []);

  useEffect(() => {
    if (statusData?.status === "authorized" && statusData.tokens) {
      // Tokens successfully received!
      const saveAndRedirect = async () => {
        // Calling a simple Next route to set the cookie
        await fetch("/api/auth/set-cookie", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: statusData.tokens!.access_token,
            expires_in: statusData.tokens!.expires_in,
          }),
        });
        router.push("/");
      };

      saveAndRedirect();
    }
  }, [statusData, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">
            Gerando código de acesso...
          </p>
        </div>
      </div>
    );
  }

  if (error || statusError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex max-w-md flex-col items-center gap-6 text-center">
          <Tv className="size-16 text-destructive" />
          <h2 className="text-2xl font-bold">Sessão Expirada ou Incorreta</h2>
          <p className="text-muted-foreground">
            Não foi possível conectar. Por favor, tente novamente.
          </p>
          <Button onClick={initSession} size="lg">
            Gerar novo código
          </Button>
        </div>
      </div>
    );
  }

  const loginUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/login?device=${deviceId}`;
  const shortCode = deviceId ? deviceId.substring(0, 6).toUpperCase() : "";

  return (
    <div className="dark relative flex min-h-screen flex-row items-center justify-center overflow-hidden bg-background p-8 md:p-24">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        {/* Left side: Instructions */}
        <div className="order-2 flex flex-col gap-8 md:order-1">
          <div className="flex items-center gap-4">
            <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-extrabold tracking-wide">
              CAMPING
            </h1>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl leading-tight font-bold md:text-5xl">
              Acesse sua conta na TV
            </h2>
            <ol className="space-y-6 text-xl text-muted-foreground">
              <li className="flex items-start gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  1
                </span>
                Abra o app da câmera no seu celular
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  2
                </span>
                Aponte para o QR Code na tela
              </li>
              <li className="flex items-start gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-primary">
                  3
                </span>
                Faça o login no seu celular para autorizar o acesso à TV
              </li>
            </ol>
          </div>
        </div>

        {/* Right side: QR Code */}
        <div className="order-1 flex flex-col items-center justify-center md:order-2">
          <div className="relative flex flex-col items-center gap-6 rounded-3xl border border-border/50 bg-card p-12 shadow-2xl">
            <div className="absolute -top-6 -right-6 -bottom-6 -left-6 -z-10 animate-pulse rounded-[2.5rem] border border-primary/20 bg-primary/5" />

            {deviceId && (
              <div className="rounded-xl bg-white p-4 shadow-inner">
                <QRCodeCanvas
                  value={loginUrl}
                  size={280}
                  level="Q"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            )}

            <div className="flex flex-col items-center gap-2">
              <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase">
                Código do dispositivo
              </p>
              <p className="font-[family-name:var(--font-montserrat)] text-4xl font-black tracking-widest text-primary">
                {shortCode}
              </p>
            </div>

            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Aguardando autorização...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
