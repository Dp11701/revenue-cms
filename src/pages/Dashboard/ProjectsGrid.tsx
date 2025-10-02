import { Card, Tag, Skeleton } from "antd";
import { useProjects } from "../../hooks/useProjects";
import { Link } from "react-router-dom";

export function ProjectsGrid() {
  const { data: projects, isLoading } = useProjects();

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {isLoading &&
        Array.from({ length: 6 }).map((_, i) => (
          <Card key={`skeleton-${i}`} className="rounded-xl">
            <Skeleton active />
          </Card>
        ))}
      {projects?.map((project) => (
        <Link key={project.id} to={`/projects/${project.id}`} className="block">
          <Card
            hoverable
            className="group overflow-hidden rounded-xl border border-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-lg"
            title={
              <div className="flex items-center justify-between">
                <span>{project.name}</span>
                <Tag
                  color={
                    project.status === "active"
                      ? "green"
                      : project.status === "paused"
                      ? "orange"
                      : "red"
                  }
                >
                  {project.status}
                </Tag>
              </div>
            }
          >
            <div className="mb-3 h-20 w-full rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
            <p className="text-gray-600">{project.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
