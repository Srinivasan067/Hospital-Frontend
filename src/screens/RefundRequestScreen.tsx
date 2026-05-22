import React, { useState } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';

const REFUND_REASONS = [
  'Ordered by mistake',
  'Duplicate order placed',
  'Medicine not required anymore',
  'Doctor changed prescription',
  'Wrong medicine selected',
  'Other',
];

const REFUND_CONDITIONS = [
  'Refund requests must be raised within 24 hours of order placement.',
  'Medicines that have already been dispensed from the pharmacy counter are non-refundable.',
  'Controlled substances (Schedule H/H1) cannot be returned as per government regulations.',
  'Partial refunds are not supported — the full order will be refunded.',
  'Approved refunds are processed within 5–7 business days to the original payment method.',
];

export default function RefundRequestScreen() {
  const route      = useRoute<any>();
  const navigation = useNavigation();
  const addNotification = useStore(state => state.addNotification);

  const { orderId, total } = route.params || {};

  const [agreed,       setAgreed]       = useState(false);
  const [reason,       setReason]       = useState('');
  const [submitted,    setSubmitted]    = useState(false);

  const handleSubmit = () => {
    if (!reason) {
      Alert.alert('Select Reason', 'Please select a reason for the refund before submitting.');
      return;
    }
    if (!agreed) {
      Alert.alert('Accept Conditions', 'Please accept the refund conditions to proceed.');
      return;
    }

    setSubmitted(true);
    addNotification({
      title: 'Refund Request Raised',
      message: `Refund request for order ${orderId} has been submitted. ₹${total} will be processed within 5-7 business days.`,
    });
  };

  if (submitted) {
    return (
      <View style={styles.container}>
        <View style={styles.successBox}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons name="check-circle" size={70} color={theme.colors.success} />
          </View>
          <Text style={styles.successTitle}>Refund Request Submitted!</Text>
          <Text style={styles.successSub}>
            Your refund of <Text style={{ fontWeight: 'bold', color: theme.colors.primary }}>₹{total}</Text> for order{' '}
            <Text style={{ fontWeight: 'bold' }}>{orderId}</Text> has been raised.
          </Text>
          <Text style={styles.successNote}>
            You will receive a notification once the refund is processed (5–7 business days).
          </Text>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backBtnText}>Back to Orders</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Order Info */}
      <View style={styles.orderInfoCard}>
        <MaterialCommunityIcons name="receipt" size={28} color={theme.colors.primary} />
        <View style={styles.orderInfoText}>
          <Text style={styles.orderInfoId}>{orderId}</Text>
          <Text style={styles.orderInfoAmount}>Refund Amount: ₹{total}</Text>
        </View>
      </View>

      {/* Important Conditions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#C05621" />
          <Text style={styles.sectionTitle}>Important Conditions</Text>
        </View>
        <View style={styles.conditionsBox}>
          {REFUND_CONDITIONS.map((c, i) => (
            <View key={i} style={styles.conditionRow}>
              <Text style={styles.conditionBullet}>{i + 1}.</Text>
              <Text style={styles.conditionText}>{c}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Reason */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Reason for Refund *</Text>
        <View style={styles.reasonsBox}>
          {REFUND_REASONS.map(r => (
            <TouchableOpacity
              key={r}
              style={[styles.reasonRow, reason === r && styles.reasonRowSelected]}
              onPress={() => setReason(r)}
            >
              <View style={[styles.radioCircle, reason === r && styles.radioCircleSelected]}>
                {reason === r && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.reasonText, reason === r && { color: theme.colors.primary, fontWeight: '600' }]}>
                {r}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Agree checkbox */}
      <TouchableOpacity style={styles.agreeRow} onPress={() => setAgreed(a => !a)}>
        <View style={[styles.checkbox, agreed && styles.checkboxChecked]}>
          {agreed && <MaterialCommunityIcons name="check" size={16} color="#fff" />}
        </View>
        <Text style={styles.agreeText}>
          I have read and agree to the refund conditions stated above.
        </Text>
      </TouchableOpacity>

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitBtn, (!reason || !agreed) && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={!reason || !agreed}
      >
        <MaterialCommunityIcons name="send-check" size={22} color="#fff" />
        <Text style={styles.submitBtnText}>Submit Refund Request</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  scroll:    { padding: 20, paddingBottom: 50 },

  orderInfoCard:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 18, gap: 14, marginBottom: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 3 },
  orderInfoText:   { flex: 1 },
  orderInfoId:     { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary },
  orderInfoAmount: { fontSize: 15, color: '#4A5568', marginTop: 3 },

  section:       { marginBottom: 22 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionTitle:  { fontSize: 16, fontWeight: 'bold', color: theme.colors.text },

  conditionsBox:  { backgroundColor: '#FFF3CD', borderRadius: 14, padding: 16, borderLeftWidth: 4, borderLeftColor: '#F6AD55' },
  conditionRow:   { flexDirection: 'row', gap: 8, marginBottom: 10 },
  conditionBullet:{ fontSize: 14, fontWeight: 'bold', color: '#C05621', minWidth: 18 },
  conditionText:  { flex: 1, fontSize: 13, color: '#7B341E', lineHeight: 20 },

  reasonsBox:         { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  reasonRow:          { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  reasonRowSelected:  { backgroundColor: '#EBF4FF' },
  radioCircle:        { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center' },
  radioCircleSelected:{ borderColor: theme.colors.primary },
  radioDot:           { width: 10, height: 10, borderRadius: 5, backgroundColor: theme.colors.primary },
  reasonText:         { fontSize: 15, color: '#4A5568' },

  agreeRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  checkbox:        { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: '#CBD5E0', justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  agreeText:       { flex: 1, fontSize: 14, color: '#4A5568', lineHeight: 22 },

  submitBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#C53030', borderRadius: 16, paddingVertical: 18 },
  submitBtnDisabled: { backgroundColor: '#CBD5E0' },
  submitBtnText:     { fontSize: 17, fontWeight: 'bold', color: '#fff', letterSpacing: 0.4 },

  /* success state */
  successBox:    { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIcon:   { marginBottom: 20 },
  successTitle:  { fontSize: 26, fontWeight: 'bold', color: theme.colors.text, marginBottom: 14, textAlign: 'center' },
  successSub:    { fontSize: 16, color: '#4A5568', textAlign: 'center', lineHeight: 24, marginBottom: 12 },
  successNote:   { fontSize: 14, color: '#718096', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  backBtn:       { backgroundColor: theme.colors.primary, paddingVertical: 16, paddingHorizontal: 40, borderRadius: 14 },
  backBtnText:   { fontSize: 16, fontWeight: 'bold', color: '#fff' },
});
