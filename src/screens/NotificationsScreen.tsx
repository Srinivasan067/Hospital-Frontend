import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Notification } from '../types';

export default function NotificationsScreen() {
  const notifications = useStore(state => state.notifications);
  const markNotificationsRead = useStore(state => state.markNotificationsRead);

  useEffect(() => {
    return () => {
      markNotificationsRead();
    };
  }, []);

  const renderNotification = ({ item }: { item: Notification }) => {
    const date = new Date(item.date).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' });
    
    return (
      <View style={[styles.card, !item.read && styles.unreadCard]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="bell-ring" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <Text style={styles.message}>{item.message}</Text>
        </View>
        {!item.read && <View style={styles.dot} />}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="bell-sleep-outline" size={80} color="#CBD5E0" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: 15, gap: 12 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, alignItems: 'flex-start' },
  unreadCard: { backgroundColor: '#F0F4FF' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  content: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  title: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },
  date: { fontSize: 12, color: '#A0AEC0' },
  message: { fontSize: 14, color: '#4A5568', lineHeight: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary, marginTop: 5, marginLeft: 10 },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#A0AEC0' }
});
