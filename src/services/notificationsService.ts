import { api, apiURL } from './apiClient';
import { getToken } from './authService';

type SourceType = 'community' | 'channel';

export interface NotificationPreference {
  sourceId: string;
  sourceType: SourceType;
  email: boolean;
  push: boolean;
}

export interface UpdatePreferencePayload {
  sourceId: string;
  sourceType: SourceType;
  email: boolean;
  push: boolean;
}

const NOTIFICATION_PREFERENCES_PATH = new URL(apiURL('/notifications/preferences')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function getPreferences(): Promise<NotificationPreference[]> {
  setAuthHeader();
  const response = await api.get<NotificationPreference[] | { data?: NotificationPreference[] }>(
    NOTIFICATION_PREFERENCES_PATH,
  );
  return Array.isArray(response) ? response : response.data ?? [];
}

export async function updatePreference(
  payload: UpdatePreferencePayload,
): Promise<NotificationPreference> {
  setAuthHeader();
  return api.patch<NotificationPreference>(NOTIFICATION_PREFERENCES_PATH, payload);
}

export async function deletePreference(sourceId: string, sourceType: SourceType): Promise<void> {
  setAuthHeader();
  await api.del<void>(
    `${NOTIFICATION_PREFERENCES_PATH}/${encodeURIComponent(sourceId)}/${encodeURIComponent(sourceType)}`,
  );
}
