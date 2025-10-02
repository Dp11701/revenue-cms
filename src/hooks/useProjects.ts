import { useQuery } from "@tanstack/react-query";
import { fetchProjectById, fetchProjects } from "../api/projects";
import type { Project } from "../types/project";

export function useProjects() {
  return useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: fetchProjects,
    staleTime: 60_000,
  });
}

export function useProjectById(projectId: string) {
  return useQuery<Project | undefined>({
    queryKey: ["projects", projectId],
    queryFn: () => fetchProjectById(projectId),
    enabled: !!projectId,
  });
}
