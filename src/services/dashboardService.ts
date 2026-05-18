import { api, apiURL } from './apiClient';
import { getToken } from './authService';

export interface ProfessionalDashboard {
  totalContacts: number;
  totalEducations: number;
  totalCertifications: number;
  totalDocuments: number;
  totalMessages: number;
  totalCommunityPosts: number;
  totalJobApplications: number;
  totalValidations: number;
  planName: string | null;
  planExpirationDate: string | null;
  trialEndDate: string | null;
  isOnTrial: boolean;
}

const PROFESSIONAL_DASHBOARD_PATH = new URL(apiURL('/dashboard/professional')).pathname;

export async function fetchProfessionalDashboard(): Promise<ProfessionalDashboard> {
  const token = getToken();
  if (token) {
    api.setHeader('Authorization', `Bearer ${token}`);
  }
  return api.get<ProfessionalDashboard>(PROFESSIONAL_DASHBOARD_PATH);
}
