import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { usePortfolioStore } from '../state/portfolioStore';
import type { PortfolioItem } from '../types/portfolio';

export default function Portfolio() {
  const { items, addItem, updateItem, removeItem, loadFromStorage } = usePortfolioStore();
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [avgPrice, setAvgPrice] = useState('');

  useEffect(() => {
    void loadFromStorage();
  }, [loadFromStorage]);

  const onAdd = () => {
    const s = symbol.trim().toUpperCase();
    const sh = Number(shares);
    const ap = Number(avgPrice);
    if (!s) {
      Alert.alert('Lỗi', 'Mã CP không được để trống');
      return;
    }
    if (!Number.isFinite(sh) || sh <= 0) {
      Alert.alert('Lỗi', 'Số lượng phải là số dương');
      return;
    }
    if (!Number.isFinite(ap) || ap <= 0) {
      Alert.alert('Lỗi', 'Giá vốn phải là số dương');
      return;
    }
    addItem({ symbol: s, shares: sh, avgPrice: ap });
    setSymbol('');
    setShares('');
    setAvgPrice('');
  };

  const renderItem = ({ item }: { item: PortfolioItem }) => (
    <View style={styles.row}>
      <Text style={styles.symbol}>{item.symbol}</Text>
      <TextInput
        style={styles.inputSmall}
        value={String(item.shares)}
        keyboardType="numeric"
        onChangeText={(t) => {
          const v = Number(t);
          if (Number.isFinite(v) && v >= 0) updateItem(item.id, { shares: v });
        }}
      />
      <TextInput
        style={styles.inputSmall}
        value={String(item.avgPrice)}
        keyboardType="numeric"
        onChangeText={(t) => {
          const v = Number(t);
          if (Number.isFinite(v) && v >= 0) updateItem(item.id, { avgPrice: v });
        }}
      />
      <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>Xóa</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.header}>Danh mục của tôi</Text>
        <View style={styles.addRow}>
          <TextInput
            placeholder="Mã CP"
            value={symbol}
            onChangeText={setSymbol}
            style={styles.input}
            autoCapitalize="characters"
          />
          <TextInput
            placeholder="Số lượng"
            value={shares}
            onChangeText={setShares}
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            placeholder="Giá vốn"
            value={avgPrice}
            onChangeText={setAvgPrice}
            keyboardType="numeric"
            style={styles.input}
          />
          <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
            <Text style={styles.addText}>Thêm</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={items}
          keyExtractor={(it) => it.id}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.empty}>Chưa có mã nào</Text>}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#111827',
  },
  addBtn: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  addText: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 8,
  },
  symbol: {
    width: 56,
    fontWeight: '700',
    color: '#1f2937',
  },
  inputSmall: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    color: '#111827',
  },
  deleteBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#ef4444',
    borderRadius: 6,
  },
  deleteText: {
    color: '#fff',
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 12,
  },
});
