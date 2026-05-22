import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ScrollView, Dimensions } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function PaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const amount = route.params?.amount || 0;

  const [status, setStatus] = useState<'processing' | 'success'>('processing');
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const [orderId, setOrderId] = useState('');

  const cart            = useStore(state => state.cart);
  const clearCart       = useStore(state => state.clearCart);
  const addOrder        = useStore(state => state.addOrder);
  const addNotification = useStore(state => state.addNotification);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
      setOrderId(newId);
      setStatus('success');

      addOrder({
        id: newId,
        items: [...cart],
        total: amount,
        date: new Date().toISOString(),
        paymentStatus: 'Success',
        approvalStatus: 'Approved',
      });
      clearCart();
      addNotification({
        title: 'Order Placed Successfully 🎉',
        message: `Your order ${newId} has been placed. Amount paid: ₹${amount}`,
      });

      Animated.sequence([
        Animated.spring(scaleAnim,  { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.timing(fadeAnim,   { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      ]).start();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (status === 'processing') {
    return (
      <LinearGradient colors={[theme.colors.primary, theme.colors.accent]} style={styles.processingBg}>
        <View style={styles.processingContent}>
          <View style={styles.processingIconRing}>
            <MaterialCommunityIcons name="shield-check" size={50} color="#fff" />
          </View>
          <Text style={styles.processingTitle}>Processing Payment</Text>
          <Text style={styles.processingAmount}>₹{amount}</Text>
          <Text style={styles.processingNote}>Please do not press back or close the app</Text>
          <View style={styles.dotsRow}>
            {[0, 1, 2].map(i => (
              <View key={i} style={styles.dot} />
            ))}
          </View>
          <Text style={styles.secureText}>🔒  Secured by Razorpay</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Hero success section */}
      <LinearGradient colors={['#0A5C3E', '#1A9460', '#22C55E']} style={styles.successHero}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <View style={styles.checkCircle}>
            <MaterialCommunityIcons name="check-bold" size={72} color="#fff" />
          </View>
        </Animated.View>
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={styles.successHeroTitle}>Payment Successful!</Text>
          <Text style={styles.successHeroSub}>Your order has been confirmed</Text>
        </Animated.View>
      </LinearGradient>

      {/* Amount pill */}
      <Animated.View style={[styles.amountPill, { transform: [{ scale: bounceAnim }] }]}>
        <Text style={styles.amountPillLabel}>Amount Paid</Text>
        <Text style={styles.amountPillValue}>₹{amount}</Text>
      </Animated.View>

      {/* Receipt card */}
      <Animated.View style={[styles.receiptCard, { opacity: fadeAnim }]}>
        <Text style={styles.receiptTitle}>Transaction Details</Text>

        {[
          { label: 'Order ID',        value: orderId,                     icon: 'receipt' },
          { label: 'Payment Method',  value: 'UPI',                       icon: 'cellphone' },
          { label: 'Status',          value: 'Success ✓',                 icon: 'check-circle-outline' },
          { label: 'Date',            value: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), icon: 'calendar' },
          { label: 'Delivery',        value: 'Within 2 hours',            icon: 'truck-fast-outline' },
        ].map(row => (
          <View key={row.label} style={styles.receiptRow}>
            <View style={styles.receiptRowLeft}>
              <MaterialCommunityIcons name={row.icon as any} size={20} color={theme.colors.primary} />
              <Text style={styles.receiptLabel}>{row.label}</Text>
            </View>
            <Text style={[styles.receiptValue, row.label === 'Status' && { color: '#22C55E' }]}>
              {row.value}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Items summary */}
      <Animated.View style={[styles.itemsCard, { opacity: fadeAnim }]}>
        <Text style={styles.receiptTitle}>Items Ordered</Text>
        {(route.params?.items || []).map((item: any, i: number) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.quantity}× {item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
          </View>
        ))}
      </Animated.View>

      {/* Note */}
      <Animated.View style={[styles.noteBox, { opacity: fadeAnim }]}>
        <MaterialCommunityIcons name="information-outline" size={20} color={theme.colors.primary} />
        <Text style={styles.noteText}>
          You can raise a refund request from Order History within 24 hours of placing the order.
        </Text>
      </Animated.View>

      <Button
        mode="contained"
        onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
        style={styles.doneBtn}
        contentStyle={styles.doneBtnContent}
        labelStyle={styles.doneBtnLabel}
      >
        Back to Dashboard
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  /* ── processing ── */
  processingBg:      { flex: 1, justifyContent: 'center', alignItems: 'center' },
  processingContent: { alignItems: 'center', paddingHorizontal: 30 },
  processingIconRing:{ width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)', justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  processingTitle:   { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  processingAmount:  { fontSize: 48, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  processingNote:    { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 30 },
  dotsRow:           { flexDirection: 'row', gap: 10, marginBottom: 30 },
  dot:               { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.6)' },
  secureText:        { fontSize: 14, color: 'rgba(255,255,255,0.9)', fontWeight: '600' },

  /* ── success ── */
  container:         { flex: 1, backgroundColor: '#F0FFF4' },
  scrollContent:     { paddingBottom: 40 },

  successHero:       { width: '100%', paddingTop: 60, paddingBottom: 50, alignItems: 'center', gap: 20 },
  checkCircle:       { width: 130, height: 130, borderRadius: 65, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  successHeroTitle:  { fontSize: 34, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  successHeroSub:    { fontSize: 18, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },

  amountPill:        { marginHorizontal: 24, marginTop: -26, backgroundColor: '#fff', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#22C55E', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.25, shadowRadius: 14, elevation: 8 },
  amountPillLabel:   { fontSize: 14, color: '#718096', marginBottom: 4 },
  amountPillValue:   { fontSize: 42, fontWeight: 'bold', color: '#0A5C3E' },

  receiptCard:       { marginHorizontal: 24, marginTop: 20, backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  receiptTitle:      { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 18 },
  receiptRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0FFF4' },
  receiptRowLeft:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  receiptLabel:      { fontSize: 15, color: '#4A5568' },
  receiptValue:      { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },

  itemsCard:         { marginHorizontal: 24, marginTop: 16, backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  itemRow:           { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  itemName:          { fontSize: 15, color: '#4A5568' },
  itemPrice:         { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },

  noteBox:           { marginHorizontal: 24, marginTop: 16, backgroundColor: '#EBF4FF', borderRadius: 14, padding: 16, flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  noteText:          { flex: 1, fontSize: 13, color: '#2B6CB0', lineHeight: 20 },

  doneBtn:           { marginHorizontal: 24, marginTop: 24, borderRadius: 16, backgroundColor: '#0A5C3E' },
  doneBtnContent:    { height: 60 },
  doneBtnLabel:      { fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
});
