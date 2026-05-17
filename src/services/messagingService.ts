import { api } from './apiClient';

export interface ConversationParticipant {
  userId: string;
  profileId?: string | null;
  name?: string | null;
  email?: string | null;
  photo?: string | null;
}

export interface Message {
  id: string;
  conversationId?: string;
  senderUserId: string;
  receiverUserId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
  isRead?: boolean;
  sender?: ConversationParticipant;
}

export interface Conversation {
  id: string;
  participants?: ConversationParticipant[];
  otherUserId?: string | null;
  otherUserName?: string | null;
  otherUserEmail?: string | null;
  lastMessage?: Message | string | null;
  lastMessageDate?: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchConversations(): Promise<Conversation[]> {
  return api.get<Conversation[]>('/messages/conversations');
}

export async function fetchMessages(userId: string): Promise<Message[]> {
  return api.get<Message[]>(`/messages/conversations/${userId}`);
}

export async function sendMessage(recipientUserId: string, content: string): Promise<Message> {
  return api.post<Message>('/messages', { receiverId: recipientUserId, content });
}

export async function startConversation(participantUserId: string, content: string): Promise<Message> {
  return sendMessage(participantUserId, content);
}

export async function fetchRecipients(query: string): Promise<ConversationParticipant[]> {
  return api.get<ConversationParticipant[]>('/messages/recipients', { q: query });
}

export async function markAsRead(messageId: string): Promise<{ success: boolean }> {
  return api.patch<{ success: boolean }>(`/messages/${messageId}/read`, {});
}

export async function deleteMessage(messageId: string, forAll = false): Promise<{ success: boolean }> {
  return api.del<{ success: boolean }>(`/messages/${messageId}`, { forAll });
}
