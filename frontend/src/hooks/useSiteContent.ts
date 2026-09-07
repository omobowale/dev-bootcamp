import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { SiteContent, SiteContentDocument } from '../types/siteContent';
export function useSiteContent() { return useQuery({ queryKey: ['site-content'], queryFn: async () => (await apiClient.get<SiteContent>('/api/site-content')).data }); }
export function useAdminSiteContent() { return useQuery({ queryKey: ['admin', 'site-content'], queryFn: async () => (await apiClient.get<SiteContentDocument>('/api/admin/site-content')).data }); }
export function useSaveSiteContent() {
  const client = useQueryClient();
  return useMutation({ meta: { notify: true }, mutationFn: async (document: SiteContentDocument) => (await apiClient.put<SiteContentDocument>('/api/admin/site-content', document)).data, onSuccess: data => { client.setQueryData(['admin', 'site-content'], data); void client.invalidateQueries({ queryKey: ['site-content'] }); } });
}
