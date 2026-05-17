import { api } from './apiClient';

interface UploadCommunityImageResponse {
  id: string;
  url: string;
}

type CommunityImageEntityType = 'POST' | 'COMMENT';

export async function uploadCommunityImage(file: File): Promise<UploadCommunityImageResponse> {
  const formData = new FormData();
  formData.append('file', file);

  return api.upload<UploadCommunityImageResponse>('/community/uploads/images', formData);
}

export async function associateCommunityImages(
  imageIds: string[],
  entityId: string,
  entityType: CommunityImageEntityType,
): Promise<void> {
  await api.patch('/community/uploads/images/associate', { imageIds, entityId, entityType });
}

// Trazabilidad: creado por Programmer en 2026-05-16 15:00:00
