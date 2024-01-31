import useApi from './useApi';
import { UseQueryOptions } from '@tanstack/react-query';

export function useWebsiteMetrics(
  websiteId: string,
  params?: { [key: string]: any },
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>,
) {
  const { get, useQuery } = useApi();

  return useQuery({
    queryKey: [
      'websites:metrics',
      {
        websiteId,
        ...params,
      },
    ],
    queryFn: async () => {
      const filters = { ...params };

      filters[params.type] = undefined;

      const data = await get(`/websites/${websiteId}/metrics`, {
        ...filters,
      });

      return data;
    },
    ...options,
  });
}

export default useWebsiteMetrics;
