import useSWR from "swr";

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json());

export function useDashboard() {
  const { data, error, isLoading } = useSWR(
    "http://localhost:8000/api/dashboard",
    fetcher,
  );

  return {
    data,
    isLoading,
    isError: error,
  };
}
