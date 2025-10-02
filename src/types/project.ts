export type ProjectStatus = "active" | "paused" | "archived";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
}

export type EnvironmentStatus = "published" | "draft" | "archived";

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
  rawKey: string;
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
  data: ApiKey[];
}
