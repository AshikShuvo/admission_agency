import { apiClient, type ApiResult } from "@/lib/api/client";
import { createAccessFromContract, type CurrentAccessResponse, type CurrentUserAccess } from "@/lib/acl/permissions";

export type GetCurrentUserResponse = CurrentUserAccess;

export async function getCurrentUserAccess(): Promise<GetCurrentUserResponse> {
  return createAccessFromContract(await apiClient.request<CurrentAccessResponse>("/auth/me"));
}

export async function getCurrentUserAccessResult(): Promise<ApiResult<GetCurrentUserResponse>> {
  const result = await apiClient.requestResult<CurrentAccessResponse>("/auth/me");

  if (!result.ok || !result.data) {
    return {
      data: null,
      error: result.error,
      ok: false
    };
  }

  return {
    data: createAccessFromContract(result.data),
    error: null,
    ok: true
  };
}
