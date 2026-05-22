import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Order } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function OrderHistoryScreen() {
  const orders = useStore(state => state.orders);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const renderOrder = ({ item }: { item: Order }) => {
    const date = new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const time = new Date(item.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // Eligible for refund if placed within 24 hours
    const placedAt = new Date(item.date).getTime();
    const now = Date.now();
    const withinRefundWindow = (now - placedAt) < 24 * 60 * 60 * 1000;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.orderIconBg}>
              <MaterialCommunityIcons name="package-variant-closed" size={22} color={theme.colors.primary} />
            </View>
            <View>
              <Text style={styles.orderId}>{item.id}</Text>
              <Text style={styles.date}>{date} · {time}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.paymentStatus === 'Success' ? '#C6F6D5' : '#FED7D7' }]}>
            <MaterialCommunityIcons
              name={item.paymentStatus === 'Success' ? 'check-circle' : 'close-circle'}
              size={13}
              color={item.paymentStatus === 'Success' ? theme.colors.success : theme.colors.error}
            />
            <Text style={[styles.statusText, { color: item.paymentStatus === 'Success' ? theme.colors.success : theme.colors.error }]}>
              {item.paymentStatus}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items list */}
        <View style={styles.itemsList}>
          {item.items.map((cartItem, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemLeft}>
                <View style={styles.itemDot} />
                <Text style={styles.itemName}>{cartItem.quantity}× {cartItem.name}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{cartItem.price * cartItem.quantity}</Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalAmount}>₹{item.total}</Text>
          </View>

          {/* Refund Button */}
          {item.paymentStatus === 'Success' && withinRefundWindow ? (
            <TouchableOpacity
              style={styles.refundBtn}
              onPress={() => navigation.navigate('RefundRequest', { orderId: item.id, total: item.total })}
            >
              <MaterialCommunityIcons name="cash-refund" size={16} color="#C53030" />
              <Text style={styles.refundBtnText}>Raise Refund</Text>
            </TouchableOpacity>
          ) : item.paymentStatus === 'Success' ? (
            <View style={styles.refundExpiredTag}>
              <MaterialCommunityIcons name="clock-alert-outline" size={14} color="#718096" />
              <Text style={styles.refundExpiredText}>Refund Expired</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={90} color="#CBD5E0" />
            <Text style={styles.emptyTitle}>No Orders Yet</Text>
            <Text style={styles.emptyText}>Your completed orders will appear here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: 15, gap: 16, paddingBottom: 30 },

  card: { backgroundColor: theme.colors.surface, borderRadius: 18, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },

  cardHeader:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  orderIconBg:  { width: 42, height: 42, borderRadius: 12, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' },
  orderId:      { fontSize: 15, fontWeight: 'bold', color: theme.colors.primary },
  date:         { fontSize: 12, color: '#718096', marginTop: 2 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText:   { fontSize: 12, fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: '#EDF2F7', marginVertical: 13 },

  itemsList: { gap: 10 },
  itemRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  itemDot:   { width: 7, height: 7, borderRadius: 4, backgroundColor: theme.colors.primary },
  itemName:  { fontSize: 14, color: '#4A5568', flex: 1 },
  itemPrice: { fontSize: 14, fontWeight: '600', color: theme.colors.text },

  footer:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  totalLabel:  { fontSize: 13, color: '#718096', marginBottom: 2 },
  totalAmount: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },

  refundBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderColor: '#FC8181', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9, backgroundColor: '#FFF5F5' },
  refundBtnText:     { fontSize: 13, fontWeight: 'bold', color: '#C53030' },
  refundExpiredTag:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: '#F7FAFC', borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  refundExpiredText: { fontSize: 12, color: '#718096' },

  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyTitle:     { marginTop: 16, fontSize: 20, fontWeight: 'bold', color: '#A0AEC0' },
  emptyText:      { marginTop: 6, fontSize: 14, color: '#CBD5E0', textAlign: 'center' },
});
