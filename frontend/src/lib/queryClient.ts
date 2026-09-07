import { MutationCache, QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { notify } from './notify';
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: error => {
      const fields = axios.isAxiosError(error) ? error.response?.data?.fieldErrors : undefined;
      const message = fields ? Object.values(fields).slice(0, 3).join(' · ') : axios.isAxiosError(error) ? error.response?.data?.message : undefined;
      notify(typeof message === 'string' ? message : 'We couldn’t save that change. Your entries are still here—please try again.', 'error');
    },
    onSuccess: (_data, _variables, _result, mutation) => { if (mutation.meta?.notify) notify('Your changes have been saved.'); },
  }),
  defaultOptions: { queries: { staleTime: 60000, retry: 1, refetchOnWindowFocus: false } },
});
