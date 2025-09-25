import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Text, View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, KeyboardAvoidingView, Platform, FlatList, Linking, TouchableOpacity } from 'react-native';
import RNMarkdown from '../components/Markdown';
import Portfolio from '../components/Portfolio';
import { useQuery } from '@tanstack/react-query';
import ChatBox from '../components/ChatBox';
import { useChatStore } from '../state/chatStore';
import { useUIStore } from '../state/uiStore';
import { useNewsClusters } from '../hooks/useNewsClusters';
// (duplicate import removed)
import NewsClusterCard from '../components/NewsClusterCard';
import { STRINGS } from '../constants/strings';

// Dummy query function for testing
const fetchTestData = async () => {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return { message: 'React Query is working!', timestamp: Date.now() };
};

// Placeholder screens for now
function FinAIScreen() {
  const { messages } = useChatStore();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        {messages.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={styles.text}>{STRINGS.FINCAKE_AI_TITLE}</Text>
            <Text style={styles.subText}>Nhập câu hỏi bên dưới</Text>
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 12 }}>
            {messages.map((item) => (
              <View key={item.id} style={[styles.bubble, item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant]}>
                {item.role === 'assistant' ? (
                  <RNMarkdown content={item.content} />
                ) : (
                  <Text style={styles.bubbleText}>{item.content}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        )}
        <ChatBox />
      </View>
    </KeyboardAvoidingView>
  );
}

function ClusterDetailScreen({ route }: any) {
  const { clusterId } = route.params;
  const { data, isLoading, error } = require('../hooks/useNewsClusters').useNewsCluster(clusterId);
  const { setPrefill } = useChatStore();
  const nav = useNavigation();
  const [input, setInput] = useState('');

  if (isLoading) return (<View style={styles.container}><ActivityIndicator size="large" color="#3b82f6" /></View>);
  if (error || !data) return (<View style={styles.container}><Text style={styles.errorText}>Không tải được chủ đề</Text></View>);

  const handleAsk = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setPrefill(q, clusterId);
    // @ts-ignore navigate to AI tab
    nav.navigate('FinCakeAI');
  };

  return (
    <ScrollView style={styles.scrollContainer}>
      <Text style={[styles.headerText, { textAlign: 'left' }]}>{data.topic}</Text>
      <Text style={[styles.subText, { textAlign: 'left', marginBottom: 6 }]}>FinCake AI tóm tắt</Text>
      <Text style={{ fontSize: 14, color: '#4b5563', lineHeight: 20, marginBottom: 16 }}>{data.summary}</Text>
      <Text style={[styles.subText, { textAlign: 'left', marginBottom: 6 }]}>Nguồn:</Text>
      {data.articles.map((a: any) => (
        <View key={a.id} style={{ marginBottom: 10 }}>
          <Text style={{ fontWeight: '600', color: '#111827' }} numberOfLines={2}>{a.title}</Text>
          <Text style={{ color: '#6b7280' }}>{a.source} • {new Date(a.published_at).toLocaleString('vi-VN')}</Text>
          <Text style={{ color: '#3b82f6' }} onPress={() => require('react-native').Linking.openURL(a.source_url)} numberOfLines={1}>{a.source_url}</Text>
        </View>
      ))}
      {/* Chat input bar */}
      <View style={styles.detailChatBar}>
        <View style={styles.detailInputWrap}>
          <Text style={styles.detailPlaceholder}>{input ? '' : 'Hỏi…'}</Text>
          <Text
            style={styles.detailTextOverlay}
            onPress={() => {}}
          >{input}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 6 }}>
            <Text onPress={() => handleAsk(`Có nên mua ${data.topic} bây giờ không?`)} style={styles.suggestChip}>✍️ Có nên mua {data.topic} bây giờ không?</Text>
            <Text onPress={() => handleAsk(`Dự báo giá ${data.topic} 30 ngày tới?`)} style={styles.suggestChip}>✍️ Dự báo giá {data.topic} 30 ngày tới?</Text>
          </ScrollView>
        </View>
        <TouchableOpacity onPress={() => handleAsk()} style={styles.detailSendBtn}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{'>'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ThiTruongListScreen({ navigation }: any) {
  const { activeTab } = useUIStore();
  const { setPrefill } = useChatStore();
  const { data: clusters, isLoading, error, refetch, isFetching } = useNewsClusters();
  const nav = useNavigation();
  
  const handleAskAI = (clusterId: string, topic: string) => {
    setPrefill(`Hãy phân tích về chủ đề: ${topic}`, clusterId);
    // Navigate to FinCake AI tab
    // @ts-ignore - simple navigation without strict typing for MVP
    nav.navigate('FinCakeAI');
  };

  const handleRefresh = () => {
    refetch();
  };
  
  if (isLoading && !isFetching) {
    return (
      <View style={styles.container}>
        <View style={{ width: '90%' }}>
          <View style={styles.skeletonHeader} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
          <View style={styles.skeletonCard} />
        </View>
        <Text style={[styles.subText, { marginTop: 12 }]}>Đang tải tin tức...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Lỗi: {error.message}</Text>
        <Text style={styles.subText} onPress={handleRefresh}>
          Nhấn để thử lại
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl
          refreshing={isFetching && !isLoading}
          onRefresh={handleRefresh}
          colors={['#3b82f6']}
        />
      }
    >
      <Text style={styles.headerText}>{STRINGS.THI_TRUONG_TITLE}</Text>
      <View style={styles.filterPillRow}>
        <View style={[styles.pill, styles.pillActive]}>
          <Text style={styles.pillText}>Danh mục của tôi</Text>
        </View>
      </View>
      <Portfolio />
      {Array.isArray(clusters) && clusters.length > 0 ? (
        clusters.map((cluster: any) => (
          <NewsClusterCard
            key={cluster.id}
            cluster={cluster}
            onAskAI={handleAskAI}
            onPress={() => (navigation as any).navigate('ClusterDetail', { clusterId: cluster.id })}
          />
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.subText}>Không có tin tức nào</Text>
        </View>
      )}
    </ScrollView>
  );
}

const Stack = createNativeStackNavigator();

function ThiTruongScreen() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ThiTruongList" component={ThiTruongListScreen} />
      <Stack.Screen name="ClusterDetail" component={ClusterDetailScreen} />
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  text: {
    fontSize: 18,
    color: '#3b82f6',
    textAlign: 'center',
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  filterPillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
  },
  pillActive: {
    backgroundColor: '#dbeafe',
    borderColor: '#93c5fd',
  },
  pillText: {
    color: '#1f2937',
    fontSize: 13,
    fontWeight: '500',
  },
  subText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 5,
  },
  clusterCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  clusterTopic: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  clusterSummary: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  articleCount: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  bubble: {
    maxWidth: '85%',
    marginBottom: 10,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#dbeafe',
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
  },
  bubbleText: {
    color: '#111827',
    fontSize: 15,
    lineHeight: 20,
  },
  skeletonHeader: {
    height: 18,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonCard: {
    height: 84,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginBottom: 10,
  },
  detailChatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    padding: 8,
    backgroundColor: '#fff',
    marginTop: 8,
    marginBottom: 16,
  },
  detailInputWrap: { flex: 1 },
  detailPlaceholder: { position: 'absolute', left: 10, top: 10, color: '#9ca3af' },
  detailTextOverlay: { minHeight: 20, color: '#111827', paddingHorizontal: 10, paddingTop: 8 },
  suggestChip: { backgroundColor: '#f3f4f6', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, color: '#374151' },
  detailSendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
});

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
      }}
    >
      <Tab.Screen 
        name="FinCakeAI" 
        component={FinAIScreen}
        options={{
          title: STRINGS.TAB_FINCAKE_AI,
        }}
      />
      <Tab.Screen 
        name="ThiTruong" 
        component={ThiTruongScreen}
        options={{
          title: STRINGS.TAB_THI_TRUONG,
        }}
      />
    </Tab.Navigator>
  );
}
