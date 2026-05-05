import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../apiClient', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    del: vi.fn(),
    upload: vi.fn(),
    downloadUrl: vi.fn((path: string) => `http://localhost:3000${path}`),
  },
}));

import { api } from '../apiClient';
import {
  addCertification,
  addEducation,
  deleteCertification,
  deleteDocument,
  deleteEducation,
  fetchCertifications,
  fetchEducation,
  getDocumentDownloadUrl,
  uploadDocument,
} from '../educationService';

describe('EducationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─── Education ────────────────────────────────────────────

  describe('fetchEducation', () => {
    it('llama a GET /professionals/:id/education', async () => {
      const mock = [{ id: 'edu-1', title: 'Lic. Psicología' }];
      (api.get as any).mockResolvedValue(mock);

      const result = await fetchEducation('prof-1');

      expect(api.get).toHaveBeenCalledWith('/professionals/prof-1/education');
      expect(result).toEqual(mock);
    });

    it('propaga errores', async () => {
      (api.get as any).mockRejectedValue(new Error('Fail'));
      await expect(fetchEducation('prof-1')).rejects.toThrow('Fail');
    });
  });

  describe('addEducation', () => {
    it('llama a POST /professionals/:id/education con body', async () => {
      const body = {
        level: 'universitario' as const,
        title: 'Lic. Psicología',
        institution: 'UBA',
        year: 2020,
      };
      const mock = { id: 'edu-new', ...body };
      (api.post as any).mockResolvedValue(mock);

      const result = await addEducation('prof-1', body);

      expect(api.post).toHaveBeenCalledWith('/professionals/prof-1/education', body);
      expect(result).toEqual(mock);
    });
  });

  describe('deleteEducation', () => {
    it('llama a DELETE /professionals/:id/education/:educationId', async () => {
      (api.del as any).mockResolvedValue({ deleted: true });

      const result = await deleteEducation('prof-1', 'edu-1');

      expect(api.del).toHaveBeenCalledWith('/professionals/prof-1/education/edu-1');
      expect(result).toEqual({ deleted: true });
    });
  });

  // ─── Certifications ───────────────────────────────────────

  describe('fetchCertifications', () => {
    it('llama a GET /professionals/:id/certifications', async () => {
      const mock = [{ id: 'cert-1', name: 'Coaching' }];
      (api.get as any).mockResolvedValue(mock);

      const result = await fetchCertifications('prof-1');

      expect(api.get).toHaveBeenCalledWith('/professionals/prof-1/certifications');
      expect(result).toEqual(mock);
    });
  });

  describe('addCertification', () => {
    it('llama a POST /professionals/:id/certifications con body', async () => {
      const body = {
        name: 'Coaching Ontológico',
        institution: 'ICF',
        year: 2023,
      };
      const mock = { id: 'cert-new', ...body };
      (api.post as any).mockResolvedValue(mock);

      const result = await addCertification('prof-1', body);

      expect(api.post).toHaveBeenCalledWith('/professionals/prof-1/certifications', body);
      expect(result).toEqual(mock);
    });
  });

  describe('deleteCertification', () => {
    it('llama a DELETE /professionals/:id/certifications/:certId', async () => {
      (api.del as any).mockResolvedValue({ deleted: true });

      const result = await deleteCertification('prof-1', 'cert-1');

      expect(api.del).toHaveBeenCalledWith('/professionals/prof-1/certifications/cert-1');
      expect(result).toEqual({ deleted: true });
    });
  });

  // ─── Documents ────────────────────────────────────────────

  describe('uploadDocument', () => {
    it('llama a upload con FormData para educación', async () => {
      const file = new File(['content'], 'titulo.pdf', {
        type: 'application/pdf',
      });
      const mockDoc = { id: 'doc-1', originalName: 'titulo.pdf' };
      (api.upload as any).mockResolvedValue(mockDoc);

      const result = await uploadDocument(file, 'title', 'edu-1', 'education');

      expect(api.upload).toHaveBeenCalledWith('/uploads/document', expect.any(FormData));
      expect(result).toEqual(mockDoc);

      // Verify FormData contents
      const formData = (api.upload as any).mock.calls[0][1] as FormData;
      expect(formData.get('type')).toBe('title');
      expect(formData.get('educationId')).toBe('edu-1');
      expect(formData.get('file')).toBe(file);
    });

    it('llama a upload con FormData para certificación', async () => {
      const file = new File(['content'], 'cert.pdf', {
        type: 'application/pdf',
      });
      const mockDoc = { id: 'doc-2', originalName: 'cert.pdf' };
      (api.upload as any).mockResolvedValue(mockDoc);

      const result = await uploadDocument(file, 'certificate', 'cert-1', 'certification');

      const formData = (api.upload as any).mock.calls[0][1] as FormData;
      expect(formData.get('type')).toBe('certificate');
      expect(formData.get('certificationId')).toBe('cert-1');
      expect(result).toEqual(mockDoc);
    });
  });

  describe('deleteDocument', () => {
    it('llama a DELETE /uploads/document/:id', async () => {
      (api.del as any).mockResolvedValue({ deleted: true });

      const result = await deleteDocument('doc-1');

      expect(api.del).toHaveBeenCalledWith('/uploads/document/doc-1');
      expect(result).toEqual({ deleted: true });
    });
  });

  describe('getDocumentDownloadUrl', () => {
    it('retorna la URL de descarga', () => {
      const url = getDocumentDownloadUrl('doc-1');

      expect(api.downloadUrl).toHaveBeenCalledWith('/uploads/document/doc-1');
      expect(url).toBe('http://localhost:3000/uploads/document/doc-1');
    });
  });
});
