import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface CommunityChannel {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityChannelMember {
  id: string;
  channelId: string;
  userId: string;
  accepted: boolean;
  createdAt: string;
}

export interface CommunityChannelPost {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  status: 'published' | 'paused';
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface CommunityChannelComment {
  id: string;
  channelId: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface PaginatedMeta {
  page: number;
  sizePage?: number;
  limit?: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  sizePage?: number;
  limit?: number;
  totalPages?: number;
  meta?: PaginatedMeta;
}

export interface CreateChannelPayload {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateChannelPayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CreatePostPayload {
  userId: string;
  content: string;
  status?: 'published' | 'paused';
}

const ADMIN_CHANNELS_PATH = new URL(apiURL('/admin/channels')).pathname;
const CHANNELS_PATH = new URL(apiURL('/channels')).pathname;

type AdminError = Error & { status?: number; body?: unknown };

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

function toAdminError(error: unknown, fallbackMessage: string): AdminError {
  if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMeta = error as { message?: string; status?: number; body?: unknown };
    const messageFromBody =
      errorWithMeta.body &&
      typeof errorWithMeta.body === 'object' &&
      'message' in errorWithMeta.body &&
      typeof (errorWithMeta.body as { message?: string }).message === 'string'
        ? (errorWithMeta.body as { message: string }).message
        : null;
    const message = messageFromBody || errorWithMeta.message || fallbackMessage;
    return Object.assign(new Error(message), {
      status: errorWithMeta.status,
      body: errorWithMeta.body,
    });
  }

  return Object.assign(new Error(fallbackMessage), {
    status: undefined,
    body: undefined,
  });
}

export async function listChannels(
  page = 1,
  limit = 10,
  isActive?: boolean,
): Promise<PaginatedResponse<CommunityChannel>> {
  setAuthHeader();
  try {
    return await api.get<PaginatedResponse<CommunityChannel>>(ADMIN_CHANNELS_PATH, {
      page,
      sizePage: limit,
      isActive,
    });
  } catch (error) {
    throw toAdminError(error, 'Error al listar grupos');
  }
}

export async function getChannel(id: string): Promise<CommunityChannel> {
  setAuthHeader();
  try {
    return await api.get<CommunityChannel>(`${ADMIN_CHANNELS_PATH}/${id}`);
  } catch (error) {
    throw toAdminError(error, 'Error al cargar el grupo');
  }
}

export async function createChannel(payload: CreateChannelPayload): Promise<CommunityChannel> {
  setAuthHeader();
  try {
    return await api.post<CommunityChannel>(ADMIN_CHANNELS_PATH, payload);
  } catch (error) {
    throw toAdminError(error, 'Error al crear el grupo');
  }
}

export async function updateChannel(id: string, payload: UpdateChannelPayload): Promise<CommunityChannel> {
  setAuthHeader();
  try {
    return await api.patch<CommunityChannel>(`${ADMIN_CHANNELS_PATH}/${id}`, payload);
  } catch (error) {
    throw toAdminError(error, 'Error al actualizar el grupo');
  }
}

export async function deleteChannel(id: string): Promise<{ message: string }> {
  setAuthHeader();
  try {
    return await api.del<{ message: string }>(`${ADMIN_CHANNELS_PATH}/${id}`);
  } catch (error) {
    throw toAdminError(error, 'Error al eliminar el grupo');
  }
}

export async function listMembers(
  channelId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<CommunityChannelMember>> {
  setAuthHeader();
  try {
    const response = await api.get<PaginatedResponse<CommunityChannelMember> | CommunityChannelMember[]>(
      `${ADMIN_CHANNELS_PATH}/${channelId}/members`,
      {
        page,
        limit,
      },
    );

    if (Array.isArray(response)) {
      return {
        data: response,
        meta: {
          page,
          limit,
          total: response.length,
          totalPages: 1,
        },
      };
    }

    return response;
  } catch (error) {
    throw toAdminError(error, 'Error al cargar miembros');
  }
}

export async function addMember(channelId: string, userId: string): Promise<CommunityChannelMember> {
  setAuthHeader();
  try {
    return await api.post<CommunityChannelMember>(`${ADMIN_CHANNELS_PATH}/${channelId}/members`, { userId });
  } catch (error) {
    throw toAdminError(error, 'Error al agregar miembro');
  }
}

export async function removeMember(channelId: string, userId: string): Promise<{ message: string }> {
  setAuthHeader();
  try {
    return await api.del<{ message: string }>(`${ADMIN_CHANNELS_PATH}/${channelId}/members/${encodeURIComponent(userId)}`);
  } catch (error) {
    throw toAdminError(error, 'Error al remover miembro');
  }
}

export async function listPosts(
  channelId: string,
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<CommunityChannelPost>> {
  setAuthHeader();
  try {
    return await api.get<PaginatedResponse<CommunityChannelPost>>(`${ADMIN_CHANNELS_PATH}/${channelId}/posts`, {
      page,
      sizePage: limit,
      includeSoftDeleted: true,
    });
  } catch (error) {
    throw toAdminError(error, 'Error al cargar publicaciones');
  }
}

export async function deletePost(channelId: string, postId: string): Promise<{ message: string }> {
  setAuthHeader();
  try {
    return await api.del<{ message: string }>(`${ADMIN_CHANNELS_PATH}/${channelId}/posts/${postId}`);
  } catch (error) {
    throw toAdminError(error, 'Error al eliminar publicación');
  }
}

export async function createPost(channelId: string, payload: CreatePostPayload): Promise<CommunityChannelPost> {
  setAuthHeader();
  try {
    return await api.post<CommunityChannelPost>(`${ADMIN_CHANNELS_PATH}/${channelId}/posts`, payload);
  } catch (error) {
    throw toAdminError(error, 'Error al crear publicación');
  }
}

export async function getPost(channelId: string, postId: string): Promise<CommunityChannelPost> {
  setAuthHeader();
  try {
    return await api.get<CommunityChannelPost>(`${CHANNELS_PATH}/${channelId}/posts/${postId}`);
  } catch (error) {
    throw toAdminError(error, 'Error al cargar publicación');
  }
}

export async function listComments(
  channelId: string,
  postId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedResponse<CommunityChannelComment>> {
  setAuthHeader();
  try {
    return await api.get<PaginatedResponse<CommunityChannelComment>>(`${CHANNELS_PATH}/${channelId}/posts/${postId}/comments`, {
      page,
      limit,
    });
  } catch (error) {
    throw toAdminError(error, 'Error al cargar comentarios');
  }
}

export async function deleteComment(channelId: string, commentId: string): Promise<{ message: string }> {
  setAuthHeader();
  try {
    return await api.del<{ message: string }>(`${ADMIN_CHANNELS_PATH}/${channelId}/comments/${commentId}`);
  } catch (error) {
    throw toAdminError(error, 'Error al eliminar comentario');
  }
}

// Traceability: implementation by Programmer at 2026-06-29 17:20:00
