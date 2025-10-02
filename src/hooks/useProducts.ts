import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchProductsByProject, type Product } from "../api/products";

export function useProductsByProject(params: {
  projectId: string;
  page: number;
  limit: number;
}) {
  const { projectId, page, limit } = params;
  return useQuery<{
    items: Product[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: ["products", { projectId, page, limit }],
    queryFn: () => fetchProductsByProject({ projectId, page, limit }),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}
