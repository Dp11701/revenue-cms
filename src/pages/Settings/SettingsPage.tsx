import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { App } from "antd";
import { environmentsApi } from "../../api/environments";
import type {
  Environment,
  CreateEnvironmentRequest,
} from "../../types/project";

export const SettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { notification } = App.useApp();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newEnvironment, setNewEnvironment] =
    useState<CreateEnvironmentRequest>({
      name: "",
      status: "published",
    });
  const [formData, setFormData] = useState({
    projectId: projectId || "7894338132156350465",
    environmentId: "",
    configuration: {
      apiUrl: "",
      timeout: 5000,
      retryAttempts: 3,
      enableLogging: true,
    },
  });

  const loadEnvironments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await environmentsApi.getEnvironments(
        formData.projectId
      );
      setEnvironments(response.data.items);
    } catch (err) {
      setError("Failed to load environments");
      console.error("Error loading environments:", err);
    } finally {
      setLoading(false);
    }
  }, [formData.projectId]);

  const handleEnvironmentChange = (environmentId: string) => {
    setSelectedEnvironment(environmentId);
    setFormData((prev) => ({
      ...prev,
      environmentId,
    }));
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewEnvironmentChange = (
    field: keyof CreateEnvironmentRequest,
    value: string
  ) => {
    setNewEnvironment((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateEnvironment = async () => {
    console.log("handleCreateEnvironment");
    if (!projectId || !newEnvironment.name.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const response = await environmentsApi.createEnvironment(
        projectId,
        newEnvironment
      );

      // Add the new environment to the list
      setEnvironments((prev) => [response.data, ...prev]);

      // Reset form
      setNewEnvironment({ name: "", status: "published" });
      setShowAddForm(false);

      notification.success({
        message: "Environment Created",
        description: `Environment "${response.data.name}" has been created successfully.`,
        placement: "topRight",
        duration: 4.5,
      });
    } catch (err) {
      setError("Failed to create environment");
      console.error("Error creating environment:", err);

      notification.error({
        message: "Failed to Create Environment",
        description:
          "There was an error creating the environment. Please try again.",
        placement: "topRight",
        duration: 4.5,
      });
    } finally {
      setCreating(false);
    }
  };
  useEffect(() => {
    if (projectId) {
      setFormData((prev) => ({
        ...prev,
        projectId,
      }));
      loadEnvironments();
    }
  }, [projectId, loadEnvironments]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you would typically save the configuration

    notification.success({
      message: "Configuration Saved",
      description: "System configuration has been saved successfully.",
      placement: "topRight",
      duration: 4.5,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-a border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            System Configuration
          </h1>
          <p className="text-gray-600 mt-1">
            Configure your system settings and environment preferences
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Project Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Project Configuration
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="projectId"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Project ID
                </label>
                <input
                  type="text"
                  id="projectId"
                  value={formData.projectId}
                  onChange={(e) =>
                    handleInputChange("projectId", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project ID"
                />
              </div>
            </div>
          </div>

          {/* Environment List */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Environments
              </h2>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {showAddForm ? "Cancel" : "Add Environment"}
              </button>
            </div>

            {/* Add Environment Form */}
            {showAddForm && (
              <div className="mb-6 p-4 bg-white border border-gray-200 rounded-lg">
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Create New Environment
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="envName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Environment Name
                      </label>
                      <input
                        type="text"
                        id="envName"
                        value={newEnvironment.name}
                        onChange={(e) =>
                          handleNewEnvironmentChange("name", e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newEnvironment.name.trim()) {
                            handleCreateEnvironment();
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., staging, testing"
                        required
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="envStatus"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Status
                      </label>
                      <select
                        id="envStatus"
                        value={newEnvironment.status}
                        onChange={(e) =>
                          handleNewEnvironmentChange("status", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateEnvironment}
                      disabled={creating || !newEnvironment.name.trim()}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? "Creating..." : "Create Environment"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Environment Cards */}
            {environments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {environments.map((env) => (
                  <div
                    key={env.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedEnvironment === env.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleEnvironmentChange(env.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {env.name}
                        </h3>
                        <p className="text-sm text-gray-500">ID: {env.id}</p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          env.status === "published"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {env.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>
                  No environments found. Create your first environment above.
                </p>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
