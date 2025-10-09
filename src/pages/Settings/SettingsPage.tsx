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
  CreateEnvVarRequest,
  EnvVar,
  UpdateEnvVarRequest,
} from "../../types/project";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  CopyOutlined,
} from "@ant-design/icons";
import { envVarApi } from "../../api/env-var";

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
  const [creatingEnvVar, setCreatingEnvVar] = useState(false);
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [loadingEnvVars, setLoadingEnvVars] = useState(false);
  const [editingEnvVarId, setEditingEnvVarId] = useState<string>("");
  const [editEnvVar, setEditEnvVar] = useState<UpdateEnvVarRequest>({});
  const [savingEnvVar, setSavingEnvVar] = useState(false);
  const [deletingEnvVarId, setDeletingEnvVarId] = useState<string>("");
  const [showEnvVarDeleteModal, setShowEnvVarDeleteModal] = useState(false);
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
  const [editingEnvId, setEditingEnvId] = useState<string>("");
  const [editEnvironment, setEditEnvironment] =
    useState<CreateEnvironmentRequest>({ name: "", status: "published" });
  const [savingEnv, setSavingEnv] = useState(false);
  const [deletingEnvId, setDeletingEnvId] = useState<string>("");
  const [showEnvDeleteModal, setShowEnvDeleteModal] = useState(false);
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

  const [envVarData, setEnvVarData] = useState<CreateEnvVarRequest>({
    key: "",
    value: "",
    environment_id: "",
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

  const loadEnvVars = useCallback(async () => {
    const envId =
      envVarData.environment_id || selectedEnvForKey || selectedEnvironment;
    if (!formData.projectId || !envId) return;

    try {
      setLoadingEnvVars(true);
      const response = await envVarApi.getEnvVars(
        formData.projectId,
        1,
        10,
        "createdAt",
        "desc",
        envId
      );
      setEnvVars(response.data.items);
    } catch (err) {
      setError("Failed to load environment variables");
      console.error("Error loading environment variables:", err);
    } finally {
      setLoadingEnvVars(false);
    }
  }, [
    formData.projectId,
    selectedEnvironment,
    selectedEnvForKey,
    envVarData.environment_id,
  ]);

  const loadApiKeys = useCallback(async () => {
    if (!formData.projectId) return;
    try {
      const response = await apiKeyApi.getApiKeys(formData.projectId);
      setApiKeys(response.data.items);
    } catch (err) {
      console.error("Error loading api keys:", err);
    }
  }, [formData.projectId]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEnvVarChange = (
    field: keyof CreateEnvVarRequest,
    value: string
  ) => {
    setEnvVarData((prev) => ({ ...prev, [field]: value }));
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

  const handleCreateEnvVar = async () => {
    const envIdToUse = envVarData.environment_id || selectedEnvironment;
    if (!formData.projectId || !envIdToUse || !envVarData.key.trim()) return;
    try {
      setCreatingEnvVar(true);
      await envVarApi.createEnvVar(formData.projectId, {
        key: envVarData.key,
        value: envVarData.value,
        environment_id: envIdToUse,
      });
      setEnvVarData({ key: "", value: "", environment_id: envIdToUse });
      // Reload environment variables
      await loadEnvVars();
      notification.success({
        message: "Environment variable created",
        placement: "topRight",
        duration: 4.5,
      });
    } catch {
      notification.error({
        message: "Failed to create environment variable",
        placement: "topRight",
        duration: 4.5,
      });
    } finally {
      setCreatingEnvVar(false);
    }
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

  const handleStartEditEnvironment = (env: Environment) => {
    setEditingEnvId(env.id);
    setEditEnvironment({ name: env.name, status: env.status });
  };

  const handleCancelEditEnvironment = () => {
    setEditingEnvId("");
    setEditEnvironment({ name: "", status: "published" });
  };

  const handleEditEnvironmentChange = (
    field: keyof CreateEnvironmentRequest,
    value: string
  ) => {
    setEditEnvironment((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEnvironment = async () => {
    if (!editingEnvId || !formData.projectId) return;
    try {
      setSavingEnv(true);
      const response = await environmentsApi.updateEnvironment(
        formData.projectId,
        editingEnvId,
        editEnvironment
      );
      const updated = response.data;
      setEnvironments((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      notification.success({
        message: "Environment Updated",
        placement: "topRight",
        duration: 3,
      });
      handleCancelEditEnvironment();
    } catch {
      notification.error({
        message: "Failed to update environment",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSavingEnv(false);
    }
  };

  const handleAskDeleteEnvironment = (envId: string) => {
    setDeletingEnvId(envId);
    setShowEnvDeleteModal(true);
  };

  const handleConfirmDeleteEnvironment = async () => {
    if (!deletingEnvId || !formData.projectId) return;
    try {
      await environmentsApi.deleteEnvironment(
        formData.projectId,
        deletingEnvId
      );
      setEnvironments((prev) => prev.filter((e) => e.id !== deletingEnvId));
      if (selectedEnvironment === deletingEnvId) {
        setSelectedEnvironment("");
      }
      notification.success({
        message: "Environment Deleted",
        placement: "topRight",
        duration: 3,
      });
    } catch {
      notification.error({
        message: "Failed to delete environment",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setShowEnvDeleteModal(false);
      setDeletingEnvId("");
    }
  };

  // Environment Variable handlers
  const handleStartEditEnvVar = (envVar: EnvVar) => {
    setEditingEnvVarId(envVar.id);
    setEditEnvVar({ key: envVar.key, value: envVar.value });
  };

  const handleCancelEditEnvVar = () => {
    setEditingEnvVarId("");
    setEditEnvVar({});
  };

  const handleEditEnvVarChange = (
    field: keyof UpdateEnvVarRequest,
    value: string
  ) => {
    setEditEnvVar((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveEnvVar = async () => {
    if (!editingEnvVarId || !formData.projectId) return;
    try {
      setSavingEnvVar(true);
      await envVarApi.updateEnvVar(
        formData.projectId,
        editingEnvVarId,
        editEnvVar
      );
      await loadEnvVars();
      notification.success({
        message: "Environment Variable Updated",
        placement: "topRight",
        duration: 3,
      });
      handleCancelEditEnvVar();
    } catch {
      notification.error({
        message: "Failed to update environment variable",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setSavingEnvVar(false);
    }
  };

  const handleAskDeleteEnvVar = (envVarId: string) => {
    setDeletingEnvVarId(envVarId);
    setShowEnvVarDeleteModal(true);
  };

  const handleConfirmDeleteEnvVar = async () => {
    if (!deletingEnvVarId || !formData.projectId) return;
    try {
      await envVarApi.deleteEnvVar(formData.projectId, deletingEnvVarId);
      await loadEnvVars();
      notification.success({
        message: "Environment Variable Deleted",
        placement: "topRight",
        duration: 3,
      });
    } catch {
      notification.error({
        message: "Failed to delete environment variable",
        placement: "topRight",
        duration: 3,
      });
    } finally {
      setShowEnvVarDeleteModal(false);
      setDeletingEnvVarId("");
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

  // Load environment variables when dropdown or selections change
  useEffect(() => {
    if (envVarData.environment_id || selectedEnvForKey || selectedEnvironment) {
      loadEnvVars();
    }
  }, [
    envVarData.environment_id,
    selectedEnvForKey,
    selectedEnvironment,
    loadEnvVars,
  ]);

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
    <div className=" mx-auto p-6">
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
                        <option value="archive">Archive</option>
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
                        ? "border-gray-200 hover:border-gray-300"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {editingEnvId === env.id ? (
                      <div className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={editEnvironment.name}
                              onChange={(e) =>
                                handleEditEnvironmentChange(
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-500 mb-1">
                              Status
                            </label>
                            <select
                              value={editEnvironment.status}
                              onChange={(e) =>
                                handleEditEnvironmentChange(
                                  "status",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                              <option value="archive">Archive</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            type="button"
                            onClick={handleCancelEditEnvironment}
                            className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveEnvironment}
                            disabled={savingEnv || !editEnvironment.name.trim()}
                            className="px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
                          >
                            {savingEnv ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {env.name}
                          </h3>
                          <p className="text-sm text-gray-500">ID: {env.id}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              env.status === "published"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {env.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleStartEditEnvironment(env)}
                            className="px-2 py-1 text-xs text-gray-700 border border-gray-200 rounded hover:bg-gray-50"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAskDeleteEnvironment(env.id)}
                            className="px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
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

          {/* Environment Variables */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Environment Variables
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Environment
                </label>
                <select
                  value={envVarData.environment_id}
                  onChange={(e) =>
                    handleEnvVarChange("environment_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select environment</option>
                  {environments.map((env) => (
                    <option key={env.id} value={env.id}>
                      {env.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key
                </label>
                <input
                  type="text"
                  value={envVarData.key}
                  onChange={(e) => handleEnvVarChange("key", e.target.value)}
                  placeholder="e.g., API_URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value
                </label>
                <input
                  type="text"
                  value={envVarData.value}
                  onChange={(e) => handleEnvVarChange("value", e.target.value)}
                  placeholder="e.g., https://api.example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex justify-end md:justify-start">
                <button
                  type="button"
                  onClick={handleCreateEnvVar}
                  disabled={
                    creatingEnvVar ||
                    !envVarData.key.trim() ||
                    !(envVarData.environment_id || selectedEnvironment)
                  }
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creatingEnvVar ? "Creating..." : "Create Env Var"}
                </button>
              </div>
            </div>

            {/* Environment Variables List */}
            {selectedEnvironment && (
              <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                  Environment Variables for{" "}
                  {
                    environments.find((env) => env.id === selectedEnvForKey)
                      ?.name
                  }
                </h3>
                {loadingEnvVars ? (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">
                      Loading environment variables...
                    </div>
                  </div>
                ) : envVars.length > 0 ? (
                  <div className="space-y-2">
                    {envVars.map((envVar) => (
                      <div
                        key={envVar.id}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                      >
                        {editingEnvVarId === envVar.id ? (
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Key
                              </label>
                              <input
                                type="text"
                                value={editEnvVar.key || ""}
                                onChange={(e) =>
                                  handleEditEnvVarChange("key", e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Value
                              </label>
                              <input
                                type="text"
                                value={editEnvVar.value || ""}
                                onChange={(e) =>
                                  handleEditEnvVarChange(
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                            </div>
                            <div className="flex items-end gap-2">
                              <button
                                onClick={handleSaveEnvVar}
                                disabled={
                                  savingEnvVar || !editEnvVar.key?.trim()
                                }
                                className="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {savingEnvVar ? "Saving..." : "Save"}
                              </button>
                              <button
                                onClick={handleCancelEditEnvVar}
                                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                <div>
                                  <span className="font-medium text-gray-900">
                                    {envVar.key}
                                  </span>
                                </div>
                                <div className="text-gray-500">=</div>
                                <div className="text-gray-700 font-mono text-sm">
                                  {envVar.value}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleStartEditEnvVar(envVar)}
                                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 focus:outline-none"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleAskDeleteEnvVar(envVar.id)}
                                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">
                      No environment variables found for this environment.
                    </div>
                  </div>
                )}
              </div>
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

          {/* Environment delete confirmation modal */}
          <ConfirmModal
            open={showEnvDeleteModal}
            onCancel={() => {
              setShowEnvDeleteModal(false);
              setDeletingEnvId("");
            }}
            onConfirm={handleConfirmDeleteEnvironment}
            title="Delete Environment"
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            Are you sure you want to delete this environment? This action cannot
            be undone.
          </ConfirmModal>

          {/* Environment Variable delete confirmation modal */}
          <ConfirmModal
            open={showEnvVarDeleteModal}
            onCancel={() => {
              setShowEnvVarDeleteModal(false);
              setDeletingEnvVarId("");
            }}
            onConfirm={handleConfirmDeleteEnvVar}
            title="Delete Environment Variable"
            okText="Delete"
            okType="danger"
            cancelText="Cancel"
          >
            Are you sure you want to delete this environment variable? This
            action cannot be undone.
          </ConfirmModal>
        </form>
      </div>
    </div>
  );
};
