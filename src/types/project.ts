export type ProjectStatus = "active" | "paused" | "archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  thumb?: string;
}

export type EnvironmentStatus = "published" | "draft" | "archive";

export interface Environment {
  id: string;
  name: string;
  status: EnvironmentStatus;
}

export interface EnvironmentsResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    items: Environment[];
    total_items: number;
    item_count: number;
    items_per_page: number;
    total_page: number;
    current_page: number;
  };
}

export interface CreateEnvironmentRequest {
  name: string;
  status: EnvironmentStatus;
}

export interface CreateEnvironmentResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: Environment;
}

export interface ApiKey {
  id: string;
  status?: string;
  created_at?: string; // some responses use created_at
  createdAt?: string; // some responses use createdAt
  hashKey?: string; // listing returns hashKey (masked)
  rawKey?: string; // creation may return rawKey (full)
  environment: Environment;
}

export interface CreateApiKeyRequest {
  environment_id: string;
}

export interface CreateApiKeyResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: ApiKey;
}

export interface ApiKeysResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    items: ApiKey[];
    total_items: number;
    item_count: number;
    items_per_page: number;
    total_page: number;
    current_page: number;
  };
}

export interface EnvVar {
  id: string;
  key: string;
  value: string;
  environment_id: string;
}

export interface CreateEnvVarRequest {
  key: string;
  value: string;
  environment_id: string;
}

export interface CreateEnvVarResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: EnvVar;
}

export interface EnvVarsResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    items: EnvVar[];
    total_items: number;
    item_count: number;
    items_per_page: number;
    total_page: number;
    current_page: number;
  };
}

export interface UpdateEnvVarRequest {
  key?: string;
  value?: string;
}

export interface UpdateEnvVarResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: EnvVar;
}

export interface DeleteEnvVarResponse {
  success: boolean;
  status_code: number;
  messages: string[];
}

// Project creation types
export interface CreateProjectRequest {
  name: string;
  thumb: string;
  status: "published" | "draft" | "archive";
}

export interface CreateProjectResponse {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    id: string;
    name: string;
    thumb?: string;
    status?: string;
  };
}
