import { api } from "./axios";
import { type ProductPayload } from "../types/common";

export type Product = {
  id: string;
  name: string;
  packageId: string;
  provider: string;
  type: string;
  status: "published" | "draft" | string;
};

type ProductsApiResponse = {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    items: Product[];
    total_items: number;
    item_count: number;
    items_per_page: number;
    total_page: number;
    current_page: number;
  };
};

export async function fetchProductsByProject(params: {
  projectId: string;
  page?: number;
  limit?: number;
}): Promise<{ items: Product[]; total: number; page: number; limit: number }> {
  const { projectId, page = 1, limit = 10 } = params;
  const url = `https://dev.begamob.com/project/revenue-cow/api/v1/projects/${projectId}/products?page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=desc`;
  const { data } = await api.get<ProductsApiResponse>(url);
  return {
    items: data.data.items ?? [],
    total: data.data.total_items ?? 0,
    page: data.data.current_page ?? page,
    limit: data.data.items_per_page ?? limit,
  };
}

export const createProduct = async (payload: ProductPayload) => {
  const { data } = await api.post<ProductsApiResponse>(
    `https://dev.begamob.com/project/revenue-cow/api/v1/projects/${payload.project_id}/products`,
    payload
  );
  return data;
};

export const deleteProduct = async (projectId: string, productId: string) => {
  const { data } = await api.delete(
    `https://dev.begamob.com/project/revenue-cow/api/v1/projects/${projectId}/products/${productId}`
  );
  return data;
};

export const getProduct = async (
  projectId: string,
  productId: string
): Promise<Product> => {
  const { data } = await api.get(
    `https://dev.begamob.com/project/revenue-cow/api/v1/projects/${projectId}/products/${productId}`
  );
  return data.data;
};

export const updateProduct = async (
  projectId: string,
  productId: string,
  payload: Partial<ProductPayload>
) => {
  const { data } = await api.patch(
    `https://dev.begamob.com/project/revenue-cow/api/v1/projects/${projectId}/products/${productId}`,
    payload
  );
  return data;
};
