import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { News } from '../lib/supabaseClient';

interface ArticleItemProps {
  article: News;
  onPress?: (article: News) => void;
}

export default function ArticleItem({ article, onPress }: ArticleItemProps) {
  const handlePress = async () => {
    if (onPress) {
      onPress(article);
      return;
    }

    // Default behavior: open URL
    try {
      const supported = await Linking.canOpenURL(article.source_url);
      if (supported) {
        await Linking.openURL(article.source_url);
      } else {
        Alert.alert('Lỗi', 'Không thể mở liên kết này');
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi mở liên kết');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {article.title}
        </Text>
        <Text style={styles.summary} numberOfLines={3}>
          {article.summary}
        </Text>
        <View style={styles.footer}>
          <Text style={styles.source}>{article.source}</Text>
          <Text style={styles.date}>
            {formatDate(article.published_at)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 18,
  },
  summary: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 16,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  source: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
  },
  date: {
    fontSize: 11,
    color: '#9ca3af',
  },
});
