import useSWR from "swr";

const fetcher = async (...args: Parameters<typeof fetch>) => {
  const res = await fetch(...args);
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error("API error");
  }
  return res.json();
};

export function useDashboard() {
  const { data, error, isLoading } = useSWR(
    "/api/proxy/api/dashboard",
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
