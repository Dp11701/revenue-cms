import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { App } from "antd";
import { ConfirmModal } from "../../components/Modal/ConfirmModal";
import { environmentsApi } from "../../api/environments";
import { apiKeyApi } from "../../api/apiKey";
import type {
  Environment,
  CreateEnvironmentRequest,
  ApiKey,
} from "../../types/project";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";

export const SettingsPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { notification } = App.useApp();
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [selectedEnvForKey, setSelectedEnvForKey] = useState<string>("");
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [revealedKeys, setRevealedKeys] = useState<Record<string, boolean>>({});
  const [creatingKey, setCreatingKey] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string>("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<{
    id: string;
    next: "active" | "in_active";
  } | null>(null);
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

  const handleCopyKey = async (keyItem: ApiKey) => {
    const full = keyItem.rawKey || keyItem.hashKey || "";
    if (!full) return;
    try {
      await navigator.clipboard.writeText(full);
      notification.success({
        message: "Copied API key",
        placement: "topRight",
        duration: 2,
      });
    } catch {
      notification.error({
        message: "Failed to copy",
        placement: "topRight",
        duration: 2,
      });
    }
  };

  const loadEnvironments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await environmentsApi.getEnvironments(
        formData.projectId
      );
      setEnvironments(response.data.items);
      // Auto-select first environment if none selected
      if (!selectedEnvironment && response.data.items.length > 0) {
        setSelectedEnvironment(response.data.items[0].id);
        setSelectedEnvForKey(response.data.items[0].id);
      }
    } catch (err) {
      setError("Failed to load environments");
      console.error("Error loading environments:", err);
    } finally {
      setLoading(false);
    }
  }, [formData.projectId, selectedEnvironment]);

  const loadApiKeys = useCallback(async () => {
    if (!formData.projectId) return;
    try {
      const response = await apiKeyApi.getApiKeys(formData.projectId);
      setApiKeys(response.data.items);
    } catch (err) {
      console.error("Error loading api keys:", err);
    }
  }, [formData.projectId]);

  const handleEnvironmentChange = (environmentId: string) => {
    setSelectedEnvironment(environmentId);
    setFormData((prev) => ({
      ...prev,
      environmentId,
    }));
    // refresh api keys list (keys are project-scoped; still refresh)
    loadApiKeys();
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
      loadApiKeys();
    }
  }, [projectId, loadEnvironments, loadApiKeys]);

  const handleCreateApiKey = async () => {
    const envIdToUse = selectedEnvForKey || selectedEnvironment;
    if (!formData.projectId || !envIdToUse) return;
    try {
      setCreatingKey(true);
      setError(null);
      const response = await apiKeyApi.createApiKey(formData.projectId, {
        environment_id: envIdToUse,
      });
      // normalize and prepend new key
      const created = response.data as ApiKey;
      const normalized: ApiKey = {
        ...created,
        hashKey: created.hashKey || created.rawKey,
        created_at:
          created.created_at || created.createdAt || new Date().toISOString(),
        status: created.status || "active",
      };
      setApiKeys((prev) => [normalized, ...prev]);
      notification.success({
        message: "API key created",
        description: `Key for environment ${response.data.environment.name} created`,
        placement: "topRight",
        duration: 4.5,
      });
    } catch (err) {
      setError("Failed to create API key");
      console.error("Error creating api key:", err);
      notification.error({
        message: "Failed to create API key",
        placement: "topRight",
        duration: 4.5,
      });
    } finally {
      setCreatingKey(false);
    }
  };

  const handleAskDeleteKey = (keyId: string) => {
    setDeletingKeyId(keyId);
    setShowDeleteModal(true);
  };

  const handleConfirmDeleteKey = async () => {
    if (!deletingKeyId) return;
    try {
      await apiKeyApi.deleteApiKey(formData.projectId, deletingKeyId);
      setApiKeys((prev) => prev.filter((k) => k.id !== deletingKeyId));
      notification.success({
        message: "API key deleted",
        placement: "topRight",
        duration: 3,
      });
    } catch {
      notification.error({
        message: "Failed to delete API key",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setShowDeleteModal(false);
      setDeletingKeyId("");
    }
  };

  const askToggleStatus = (keyItem: ApiKey) => {
    if (!keyItem?.id) return;
    const nextStatus = keyItem.status === "active" ? "in_active" : "active";
    setPendingStatus({ id: keyItem.id, next: nextStatus });
    setShowStatusModal(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!pendingStatus) return;
    const { id, next } = pendingStatus;
    const prev = apiKeys;
    setUpdatingStatusId(id);
    // optimistic update
    setApiKeys((ks) =>
      ks.map((k) => (k.id === id ? { ...k, status: next } : k))
    );
    try {
      await apiKeyApi.updateApiKeyStatus(formData.projectId, id, next);
      notification.success({
        message: `Key ${next.replace("_", " ")}`,
        placement: "topRight",
        duration: 3,
      });
    } catch {
      // revert
      setApiKeys(prev);
      notification.error({
        message: "Failed to update status",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setUpdatingStatusId("");
      setShowStatusModal(false);
      setPendingStatus(null);
    }
  };
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
                  disabled
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

          {/* API Keys */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
              <div className="flex items-center gap-2">
                <select
                  value={selectedEnvForKey}
                  onChange={(e) => setSelectedEnvForKey(e.target.value)}
                  className="px-2 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="" disabled>
                    Select environment
                  </option>
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleCreateApiKey}
                  disabled={
                    (!selectedEnvForKey && !selectedEnvironment) || creatingKey
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingKey ? "Creating..." : "Create API Key"}
                </button>
              </div>
            </div>
            {apiKeys.length > 0 ? (
              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div
                    key={key.id}
                    className="p-3 border rounded-md flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm text-gray-900 font-medium">
                        {(() => {
                          const full = key.hashKey || key.rawKey || "";
                          const isRevealed = !!revealedKeys[key.id];
                          if (!full) return "";
                          const masked =
                            full.slice(0, 6) +
                            "*".repeat(Math.max(full.length - 6, 0));
                          return isRevealed ? full : masked;
                        })()}
                        <button
                          type="button"
                          onClick={() =>
                            setRevealedKeys((prev) => ({
                              ...prev,
                              [key.id]: !prev[key.id],
                            }))
                          }
                          className=" inline-flex items-center px-2 w-4 h-6 text-xs font-[700] text-gray-500"
                        >
                          {revealedKeys[key.id] ? (
                            <EyeInvisibleOutlined />
                          ) : (
                            <EyeOutlined />
                          )}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500">
                        {key.environment?.name} •{" "}
                        {key.created_at || key.createdAt
                          ? new Date(
                              (key.created_at || key.createdAt) as string
                            ).toLocaleString()
                          : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopyKey(key)}
                        className="px-2 py-1 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50 inline-flex items-center gap-1 cursor-pointer"
                        title="Copy key"
                      >
                        <CopyOutlined />
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => askToggleStatus(key)}
                        disabled={updatingStatusId === key.id}
                        className={`px-2 py-1 text-xs rounded capitalize disabled:opacity-50 
                          ${
                            key.status === "active"
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-red-100 text-red-700 hover:bg-red-200"
                          }
                        `}
                      >
                        {updatingStatusId === key.id
                          ? "Updating..."
                          : key.status}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAskDeleteKey(key.id)}
                        className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No API keys yet.</div>
            )}
          </div>

          {/* Delete confirmation modal */}
          <ConfirmModal
            open={showDeleteModal}
            onCancel={() => {
              setShowDeleteModal(false);
              setDeletingKeyId("");
            }}
            onConfirm={handleConfirmDeleteKey}
            title="Delete API Key"
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            Are you sure you want to delete this API key? This action cannot be
            undone.
          </ConfirmModal>

          {/* Status confirmation modal */}
          <ConfirmModal
            open={showStatusModal}
            onCancel={() => {
              setShowStatusModal(false);
              setPendingStatus(null);
            }}
            onConfirm={handleConfirmStatusChange}
            title="Change API Key Status"
            okText="Confirm"
            okType="primary"
            cancelText="Cancel"
          >
            {pendingStatus
              ? `Are you sure you want to set this API key to ${pendingStatus.next.replace(
                  "_",
                  " "
                )}?`
              : null}
          </ConfirmModal>
        </form>
      </div>
    </div>
  );
};
