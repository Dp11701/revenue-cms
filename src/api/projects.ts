import { api } from "./axios";
import type {
  Project,
  CreateProjectRequest,
  CreateProjectResponse,
} from "../types/project";

type ProjectsApiResponse = {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    items: Array<{
      id: string;
      name: string;
      thumb?: string;
      status?: "published" | "draft" | "archive";
    }>;
    total_items: number;
    item_count: number;
    items_per_page: number;
    total_page: number;
    current_page: number;
  };
};

const PROJECTS_URL =
  "https://dev.begamob.com/project/revenue-cow/api/v1/projects?page=1&limit=99";

export async function fetchProjects(): Promise<Project[]> {
  const { data } = await api.get<ProjectsApiResponse>(PROJECTS_URL);
  const items = data?.data?.items ?? [];
  // Map API items -> local Project model (fill missing fields with defaults)
  return items.map((it) => ({
    id: it.id,
    name: it.name,
    description: "", // API does not provide; keep empty for now
    status:
      it.status === "published"
        ? "active"
        : it.status === "draft"
        ? "paused"
        : "archived",
    thumb: it.thumb || undefined,
  }));
}

export async function fetchProjectById(
  projectId: string
): Promise<Project | undefined> {
  // No single-item endpoint provided; fetch list and find locally
  const projects = await fetchProjects();
  return projects.find((p) => p.id === projectId);
}

const BASE_URL = "https://dev.begamob.com/project/revenue-cow/api/v1";

export async function createProject(
  payload: CreateProjectRequest
): Promise<CreateProjectResponse> {
  const url = `${BASE_URL}/projects`;
  const { data } = await api.post<CreateProjectResponse>(url, payload);
  return data;
}
