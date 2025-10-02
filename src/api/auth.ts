import { api } from "./axios";

type LoginRequest = {
  email: string;
  password: string;
};

type LoginResponse = {
  success: boolean;
  status_code: number;
  messages: string[];
  data: {
    access_token: string;
    refresh_token: string;
    member: { id: string };
  };
};

export async function loginCms(payload: LoginRequest) {
  const url = "https://dev.begamob.com/project/revenue-cow/api/v1/cms/login";
  const { data } = await api.post<LoginResponse>(url, payload);
  const accessToken = data.data.access_token;
  const refreshToken = data.data.refresh_token;
  const memberId = data.data.member?.id;

  localStorage.setItem("access_token", accessToken);
  localStorage.setItem("refresh_token", refreshToken);
  if (memberId) localStorage.setItem("member_id", memberId);

  // Update axios default header immediately
  api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

  return data;
}

export function logoutCms() {
  try {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("member_id");
    delete api.defaults.headers.common.Authorization;
  } catch {}
}
