import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { Text, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CartItem } from '../types';

export default function CartScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const cart = useStore(state => state.cart);
  const updateQuantity = useStore(state => state.updateQuantity);
  const removeFromCart = useStore(state => state.removeFromCart);
  
  const hasPendingItems = cart.some(item => item.status === 'Pending');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryCharge = cart.length > 0 ? 50 : 0;
  const total = subtotal + deliveryCharge;

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemCode}>{item.code} • ₹{item.price}</Text>
        {item.status === 'Pending' && (
          <Text style={styles.pendingText}>Requires Doctor Approval</Text>
        )}
      </View>
      <View style={styles.itemActions}>
        <View style={styles.quantityControl}>
          <TouchableOpacity onPress={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeFromCart(item.id)}>
            <MaterialCommunityIcons name={item.quantity > 1 ? "minus-circle-outline" : "delete-outline"} size={24} color={item.quantity > 1 ? theme.colors.primary : theme.colors.error} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{item.quantity}</Text>
          <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)}>
            <MaterialCommunityIcons name="plus-circle-outline" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-outline" size={80} color="#CBD5E0" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Button mode="contained" onPress={() => navigation.navigate('MainTabs', { screen: 'Search' } as any)} style={styles.shopBtn}>
            Search Medicines
          </Button>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹{subtotal}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Charges</Text>
              <Text style={styles.summaryValue}>₹{deliveryCharge}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>₹{total}</Text>
            </View>
            
            {hasPendingItems && (
              <View style={styles.warningContainer}>
                <MaterialCommunityIcons name="alert-circle-outline" size={20} color={theme.colors.pending} />
                <Text style={styles.warningText}>Remove pending items or wait for approval to proceed.</Text>
              </View>
            )}
            
            <Button 
              mode="contained" 
              onPress={() => navigation.navigate('Payment', { amount: total, items: cart })}
              disabled={hasPendingItems}
              style={[styles.checkoutBtn, hasPendingItems && { backgroundColor: '#E2E8F0' }]}
              contentStyle={{ height: 55 }}
            >
              Proceed to Payment
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, color: '#718096', marginTop: 15, marginBottom: 25 },
  shopBtn: { borderRadius: 12, backgroundColor: theme.colors.primary, width: 200 },
  list: { padding: 15 },
  cartItem: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 15, marginBottom: 15, flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  itemCode: { fontSize: 13, color: '#718096', marginBottom: 4 },
  pendingText: { fontSize: 12, color: theme.colors.pending, fontWeight: '500' },
  itemActions: { alignItems: 'flex-end', justifyContent: 'space-between' },
  quantityControl: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F7FAFC', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 },
  quantity: { fontSize: 16, fontWeight: '600', color: theme.colors.text, minWidth: 20, textAlign: 'center' },
  itemTotal: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginTop: 10 },
  summaryContainer: { backgroundColor: theme.colors.surface, padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 10 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontSize: 15, color: '#4A5568' },
  summaryValue: { fontSize: 15, color: theme.colors.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  totalLabel: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  totalValue: { fontSize: 22, fontWeight: 'bold', color: theme.colors.primary },
  warningContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFAF0', padding: 12, borderRadius: 8, marginTop: 15, gap: 8, borderWidth: 1, borderColor: '#FEEBC8' },
  warningText: { fontSize: 13, color: theme.colors.pending, flex: 1 },
  checkoutBtn: { marginTop: 20, borderRadius: 12, backgroundColor: theme.colors.primary }
});
