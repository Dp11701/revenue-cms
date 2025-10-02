import { api } from "./axios";
import type { Project } from "../types/project";

type ProjectsApiResponse = {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    items: Array<{
      id: string;
      name: string;
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
    status: "active", // API does not provide; default to active
  }));
}

export async function fetchProjectById(
  projectId: string
): Promise<Project | undefined> {
  // No single-item endpoint provided; fetch list and find locally
  const projects = await fetchProjects();
  return projects.find((p) => p.id === projectId);
}
