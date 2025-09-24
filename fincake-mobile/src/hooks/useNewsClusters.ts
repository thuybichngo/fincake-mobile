import { useQuery } from '@tanstack/react-query';
import { storage } from '../lib/storage';
import { supabase, NewsCluster, News } from '../lib/supabaseClient';

export interface NewsClusterWithArticles extends NewsCluster {
  articles: News[];
}

// Fetch news clusters with their articles
const fetchNewsClusters = async (limit?: number, offset?: number): Promise<NewsClusterWithArticles[]> => {
  // First, fetch clusters with pagination
  let query = supabase
    .from('news_clusters')
    .select('*')
    .order('created_at', { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }
  if (offset) {
    query = query.range(offset, offset + (limit || 10) - 1);
  }

  const { data: clusters, error: clustersError } = await query;

  if (clustersError) {
    throw new Error(`Failed to fetch clusters: ${clustersError.message}`);
  }

  if (!clusters || clusters.length === 0) {
    return [];
  }

  // Then, fetch articles for each cluster
  const clustersWithArticles = await Promise.all(
    clusters.map(async (cluster) => {
      const { data: articles, error: articlesError } = await supabase
        .from('news')
        .select('*')
        .eq('cluster_id', cluster.id)
        .order('published_at', { ascending: false });

      if (articlesError) {
        console.warn(`Failed to fetch articles for cluster ${cluster.id}:`, articlesError.message);
        return { ...cluster, articles: [] };
      }

      return { ...cluster, articles: articles || [] };
    })
  );

  // cache last good result
  await storage.setItem('CACHE_NEWS_CLUSTERS', clustersWithArticles);
  return clustersWithArticles;
};

export const useNewsClusters = (limit?: number, offset?: number) => {
  return useQuery({
    queryKey: ['newsClusters', limit, offset],
    queryFn: () => fetchNewsClusters(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    // if network fails, try cached
    select: (data) => data,
    placeholderData: async () => (await storage.getItem('CACHE_NEWS_CLUSTERS')) || undefined,
  });
};

// Hook for fetching a single cluster by ID
export const useNewsCluster = (clusterId: string) => {
  return useQuery({
    queryKey: ['newsCluster', clusterId],
    queryFn: async () => {
      const { data: cluster, error: clusterError } = await supabase
        .from('news_clusters')
        .select('*')
        .eq('id', clusterId)
        .single();

      if (clusterError) {
        throw new Error(`Failed to fetch cluster: ${clusterError.message}`);
      }

      const { data: articles, error: articlesError } = await supabase
        .from('news')
        .select('*')
        .eq('cluster_id', clusterId)
        .order('published_at', { ascending: false });

      if (articlesError) {
        throw new Error(`Failed to fetch articles: ${articlesError.message}`);
      }

      return { ...cluster, articles: articles || [] } as NewsClusterWithArticles;
    },
    enabled: !!clusterId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
};
