import { useMutation } from "@tanstack/react-query";
import { loginCms } from "../api/auth";

export function useLogin() {
  return useMutation({
    mutationKey: ["auth", "login"],
    mutationFn: loginCms,
  });
}
