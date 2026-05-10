/**
 * CommunityService
 * ----------------
 * Llamadas a la API para la comunidad (canales, posts, comentarios).
 * Endpoints:
 *   - GET    /community/channels        -> Canales del usuario (general + rubro)
 *   - GET    /community/posts?channel=X  -> Posts de un canal
 *   - GET    /community/my-posts         -> Mis posts con comentarios recibidos
 *   - POST   /community/posts            -> Crear post
 *   - DELETE /community/posts/:id        -> Eliminar post
 *   - PATCH  /community/posts/:id/status -> Cambiar estado (published/paused)
 *   - POST   /community/comments         -> Comentar en un post
 *   - DELETE /community/comments/:id     -> Eliminar comentario
 */

import { api } from './apiClient';

// ─── Tipos ─────────────────────────────────────────────────────

export interface Channel {
  slug: string;
  name: string;
  type: string;
}

export interface PostUser {
  id: string;
  email: string;
}

export interface Comment {
  id: string;
  userId: string;
  postId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: PostUser;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  channelSlug?: string;
  status?: 'published' | 'paused';
  createdAt: string;
  updatedAt: string;
  user: PostUser;
  _count?: { comments: number };
  comments?: Comment[];
}

export interface PaginatedPosts {
  data: Post[];
  total: number;
  page: number;
  limit: number;
}

// ─── Fetch ─────────────────────────────────────────────────────

/** Canales disponibles para el usuario (general + su rubro) */
export async function fetchChannels(): Promise<Channel[]> {
  return api.get<Channel[]>('/community/channels');
}

/** Posts de un canal */
export async function fetchPosts(channel = 'general', page = 1, limit = 20): Promise<PaginatedPosts> {
  return api.get<PaginatedPosts>('/community/posts', { channel, page, limit });
}

/** Mis posts con comentarios recibidos */
export async function fetchMyPosts(page = 1, limit = 20): Promise<PaginatedPosts> {
  return api.get<PaginatedPosts>('/community/my-posts', { page, limit });
}

/** Crear un post */
export async function createPost(content: string, channelSlug = 'general'): Promise<Post> {
  return api.post<Post>('/community/posts', { content, channelSlug });
}

/** Eliminar un post */
export async function deletePost(postId: string): Promise<void> {
  return api.del<void>(`/community/posts/${postId}`);
}

/** Cambiar estado de un post (published/paused) */
export async function updatePostStatus(postId: string, status: 'published' | 'paused'): Promise<Post> {
  return api.patch<Post>(`/community/posts/${postId}/status`, { status });
}

/** Comentar en un post */
export async function createComment(postId: string, content: string): Promise<Comment> {
  return api.post<Comment>('/community/comments', { postId, content });
}

/** Eliminar un comentario */
export async function deleteComment(commentId: string): Promise<void> {
  return api.del<void>(`/community/comments/${commentId}`);
}
