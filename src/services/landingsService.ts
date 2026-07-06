import { api, apiURL } from './apiClient';
import type { LandingField } from './landingsAdminService';

export type { LandingField } from './landingsAdminService';

export interface PublicLanding {
  id: number;
  title: string;
  body: string;
  fields: LandingField[];
}

const PUBLIC_LANDINGS_PATH = new URL(apiURL('/landings')).pathname;

export async function getLanding(idSlug: string): Promise<PublicLanding> {
  return api.get<PublicLanding>(`${PUBLIC_LANDINGS_PATH}/${encodeURIComponent(idSlug)}`);
}

export async function submitLanding(
  idSlug: string,
  data: Record<string, string>,
): Promise<{ message: string }> {
  return api.post<{ message: string }>(`${PUBLIC_LANDINGS_PATH}/${encodeURIComponent(idSlug)}/submit`, {
    data,
  });
}
