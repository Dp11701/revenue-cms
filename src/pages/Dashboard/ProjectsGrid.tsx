import {
  Card,
  Tag,
  Skeleton,
  Button,
  message,
  Modal,
  Form,
  Input,
  Select,
} from "antd";
import { useProjects } from "../../hooks/useProjects";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createProject } from "../../api/projects";

export function ProjectsGrid() {
  const { data: projects, isLoading } = useProjects();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const handleCreateProject = async () => {
    try {
      setIsCreating(true);
      const values = await form.validateFields();
      await createProject({
        name: values.name,
        thumb: values.thumb ?? "",
        status: values.status,
      });
      message.success("Project created");
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsModalOpen(false);
      form.resetFields();
    } catch {
      message.error("Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <Button type="primary" onClick={() => setIsModalOpen(true)}>
          Add Project
        </Button>
      </div>
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
            {project.thumb ? (
              <img
                src={project.thumb}
                alt={project.name}
                className="mb-3 h-20 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mb-3 h-20 w-full rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
            )}
            <p className="text-gray-600">{project.description}</p>
          </Card>
        </Link>
      ))}

      <Modal
        title="Add Project"
        open={isModalOpen}
        onOk={handleCreateProject}
        confirmLoading={isCreating}
        onCancel={() => setIsModalOpen(false)}
        okText="Create"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ status: "published" }}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please input project name" }]}
          >
            <Input placeholder="Project name" />
          </Form.Item>
          <Form.Item name="thumb" label="Thumb">
            <Input placeholder="Thumbnail URL or text" />
          </Form.Item>
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={[
                { value: "published", label: "Published" },
                { value: "draft", label: "Draft" },
                { value: "archive", label: "Archive" },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
