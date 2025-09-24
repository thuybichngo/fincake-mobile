import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { NewsClusterWithArticles } from '../hooks/useNewsClusters';
import { STRINGS } from '../constants/strings';

interface NewsClusterCardProps {
  cluster: NewsClusterWithArticles;
  onAskAI?: (clusterId: string, topic: string) => void;
  onPress?: () => void;
}

export default function NewsClusterCard({ cluster, onAskAI, onPress }: NewsClusterCardProps) {
  const handleAskAI = () => {
    if (onAskAI) {
      onAskAI(cluster.id, cluster.topic);
    }
  };

  // Extract stock tickers (simple heuristic: 3-5 uppercase letters in titles)
  const detectTickers = (): string[] => {
    const set = new Set<string>();
    const regex = /\b[A-Z]{3,5}\b/g;
    for (const a of cluster.articles) {
      const text = `${a.title} ${a.summary}`;
      const matches = text.match(regex) || [];
      matches.forEach(m => set.add(m));
    }
    return Array.from(set).slice(0, 3);
  };

  const tickers = detectTickers();

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
  };

  const thumbs = cluster.articles.slice(0, 3);

  return (
    <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
      <View style={styles.headerRow}>
        <Text style={styles.topic} numberOfLines={2}>{cluster.topic}</Text>
        {tickers.length > 0 && (
          <View style={styles.tagsRow}>
            {tickers.map(t => (
              <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>
            ))}
          </View>
        )}
      </View>

      <Text style={styles.subtitle}>FinCake AI tóm tắt</Text>
      <Text style={styles.summary} numberOfLines={3}>{cluster.summary}</Text>

      <View style={styles.thumbRow}>
        {thumbs.map((a) => (
          <View key={a.id} style={styles.thumbWrap}>
            {/* Placeholder thumbnail; replace with real image if available */}
            <View style={styles.thumbPlaceholder} />
            <Text style={styles.thumbSource} numberOfLines={1}>{getDomain(a.source_url) || a.source}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.askAIButton} onPress={handleAskAI}>
        <Text style={styles.askAIButtonText}>{STRINGS.THI_TRUONG_ASK_AI}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  topic: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  tagsRow: { flexDirection: 'row', gap: 6 },
  tag: { backgroundColor: '#e0e7ff', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  tagText: { color: '#1d4ed8', fontWeight: '600', fontSize: 12 },
  subtitle: { color: '#6b7280', fontSize: 12, marginBottom: 6 },
  summary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  thumbRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  thumbWrap: { width: 90 },
  thumbPlaceholder: { width: '100%', height: 60, backgroundColor: '#e5e7eb', borderRadius: 8 },
  thumbSource: { marginTop: 4, fontSize: 12, color: '#6b7280' },
  askAIButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  askAIButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
