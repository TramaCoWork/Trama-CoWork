import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface CommunityUserProfile {
  name?: string | null;
}

export interface CommunityUser {
  id?: string;
  email?: string;
  profile?: CommunityUserProfile | null;
}

export interface CommunityPost {
  id: string;
  content: string;
  channelSlug?: string | null;
  createdAt: string;
  updatedAt?: string;
  commentCount?: number;
  user?: CommunityUser | null;
}

export interface CommunityComment {
  id: string;
  postId?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  user?: CommunityUser | null;
}

export interface PaginatedMeta {
  page: number;
  sizePage: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: PaginatedMeta;
  page?: number;
  sizePage?: number;
  total?: number;
  totalPages?: number;
}

export interface FetchCommunityPostsParams {
  channelSlug?: string;
  page: number;
  sizePage: number;
}

export interface FetchPostCommentsParams {
  page: number;
  sizePage: number;
}

export interface DeleteMutationResponse {
  message: string;
}

const COMMUNITY_CHANNELS_PATH = new URL(apiURL('/community/channels')).pathname;
const ADMIN_COMMUNITY_POSTS_PATH = new URL(apiURL('/admin/community/posts')).pathname;
const COMMUNITY_POSTS_PATH = new URL(apiURL('/community/posts')).pathname;
const ADMIN_COMMUNITY_COMMENTS_PATH = new URL(apiURL('/admin/community/comments')).pathname;

function setAuthHeader(): void {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
}

export async function fetchChannelSlugs(): Promise<string[]> {
  setAuthHeader();
  const response = await api.get<{ data: string[] } | string[]>(COMMUNITY_CHANNELS_PATH);
  if (Array.isArray(response)) {
    return response;
  }
  return Array.isArray(response.data) ? response.data : [];
}

export async function fetchCommunityPosts(
  params: FetchCommunityPostsParams,
): Promise<PaginatedResponse<CommunityPost>> {
  setAuthHeader();
  return api.get<PaginatedResponse<CommunityPost>>(ADMIN_COMMUNITY_POSTS_PATH, {
    channelSlug: params.channelSlug,
    page: params.page,
    sizePage: params.sizePage,
  });
}

export async function fetchCommunityPostById(postId: string): Promise<CommunityPost> {
  setAuthHeader();
  return api.get<CommunityPost>(`${ADMIN_COMMUNITY_POSTS_PATH}/${postId}`);
}

export async function fetchPostComments(
  postId: string,
  params: FetchPostCommentsParams,
): Promise<PaginatedResponse<CommunityComment>> {
  setAuthHeader();
  return api.get<PaginatedResponse<CommunityComment>>(`${COMMUNITY_POSTS_PATH}/${postId}/comments`, {
    page: params.page,
    sizePage: params.sizePage,
  });
}

export async function createAdminComment(postId: string, content: string): Promise<CommunityComment> {
  setAuthHeader();
  return api.post<CommunityComment>(`${ADMIN_COMMUNITY_POSTS_PATH}/${postId}/comments`, { content });
}

export async function deletePost(postId: string): Promise<DeleteMutationResponse> {
  setAuthHeader();
  return api.del<DeleteMutationResponse>(`${ADMIN_COMMUNITY_POSTS_PATH}/${postId}`);
}

export async function deleteComment(commentId: string): Promise<DeleteMutationResponse> {
  setAuthHeader();
  return api.del<DeleteMutationResponse>(`${ADMIN_COMMUNITY_COMMENTS_PATH}/${commentId}`);
}

// Traceability: implementation by Programmer at 2026-06-29 00:00:00
