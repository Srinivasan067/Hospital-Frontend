const fs = require('fs');
const path = require('path');

function createFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content.trim() + '\n', 'utf-8');
}

const files = {
  "src/types/index.ts": `
export type MedicineStatus = 'Pending' | 'Approved' | 'Rejected';

export interface Medicine {
  id: string;
  name: string;
  code: string;
  stock: number;
  price: number;
  category: string;
  status: MedicineStatus;
}

export interface CartItem extends Medicine {
  quantity: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  paymentStatus: 'Success' | 'Failed';
  approvalStatus: 'Approved';
}

export interface User {
  name: string;
  mobile: string;
  mrn: string;
  doctor: string;
}
`,

  "src/theme/theme.ts": `
import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#1A365D',
    accent: '#6B46C1',
    background: '#F7FAFC',
    surface: '#FFFFFF',
    text: '#2D3748',
    error: '#E53E3E',
    success: '#38A169',
    pending: '#DD6B20',
    glass: 'rgba(255, 255, 255, 0.85)',
  },
  roundness: 12,
};
`,

  "src/store/useStore.ts": `
import { create } from 'zustand';
import { User, Medicine, CartItem, Notification, Order } from '../types';

interface AppState {
  user: User | null;
  setUser: (user: User | null) => void;
  
  medicines: Medicine[];
  setMedicines: (medicines: Medicine[]) => void;
  
  cart: CartItem[];
  addToCart: (medicine: Medicine) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'date' | 'read'>) => void;
  markNotificationsRead: () => void;
  
  orders: Order[];
  addOrder: (order: Order) => void;
  
  isDoctorApprovalPending: boolean;
  setDoctorApprovalPending: (status: boolean) => void;
  
  simulateDoctorApproval: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  medicines: [
    { id: '1', name: 'Dolo 650', code: 'M-101', stock: 150, price: 30, category: 'Fever', status: 'Approved' },
    { id: '2', name: 'Paracetamol', code: 'M-102', stock: 200, price: 20, category: 'Fever', status: 'Approved' },
    { id: '3', name: 'Amoxicillin', code: 'M-103', stock: 50, price: 120, category: 'Antibiotic', status: 'Pending' },
    { id: '4', name: 'Cetirizine', code: 'M-104', stock: 300, price: 40, category: 'Allergy', status: 'Approved' },
  ],
  setMedicines: (medicines) => set({ medicines }),
  
  cart: [],
  addToCart: (medicine) => set((state) => {
    const existing = state.cart.find(item => item.id === medicine.id);
    if (existing) {
      return { cart: state.cart.map(item => item.id === medicine.id ? { ...item, quantity: item.quantity + 1 } : item) };
    }
    return { cart: [...state.cart, { ...medicine, quantity: 1 }] };
  }),
  removeFromCart: (id) => set((state) => ({ cart: state.cart.filter(item => item.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({ cart: state.cart.map(item => item.id === id ? { ...item, quantity } : item) })),
  clearCart: () => set({ cart: [] }),
  
  notifications: [
    { id: 'n1', title: 'Welcome', message: 'Welcome to Bharathi Infinity Hospital Digital Pharmacy', date: new Date().toISOString(), read: false }
  ],
  addNotification: (notification) => set((state) => ({
    notifications: [{ ...notification, id: Math.random().toString(), date: new Date().toISOString(), read: false }, ...state.notifications]
  })),
  markNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true }))
  })),
  
  orders: [],
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  
  isDoctorApprovalPending: false,
  setDoctorApprovalPending: (status) => set({ isDoctorApprovalPending: status }),
  
  simulateDoctorApproval: () => {
    set({ isDoctorApprovalPending: true });
    setTimeout(() => {
      set((state) => {
        const newMeds = state.medicines.map(m => m.status === 'Pending' ? { ...m, status: 'Approved' as const } : m);
        state.addNotification({ title: 'Medicines Approved', message: 'Your pending medicines have been approved by the doctor.' });
        return { isDoctorApprovalPending: false, medicines: newMeds };
      });
    }, 5000);
  }
}));
`,

  "src/screens/SplashScreen.tsx": `
import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true })
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#e6e9f0', '#dcd9f8']} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="hospital-building" size={80} color={theme.colors.primary} />
          <MaterialCommunityIcons name="heart-pulse" size={40} color={theme.colors.accent} style={styles.subIcon} />
        </View>
        <Text style={styles.title}>Bharathi Infinity</Text>
        <Text style={styles.subtitle}>Hospital</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Smart Digital Pharmacy & Prescription Management</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { alignItems: 'center', padding: 20 },
  iconContainer: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: theme.colors.glass,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10,
    marginBottom: 30, position: 'relative'
  },
  subIcon: { position: 'absolute', bottom: 20, right: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: 28, fontWeight: '300', color: theme.colors.primary, marginBottom: 20 },
  divider: { width: 50, height: 3, backgroundColor: theme.colors.accent, borderRadius: 2, marginBottom: 20 },
  tagline: { fontSize: 14, color: '#4A5568', textAlign: 'center', maxWidth: 250, lineHeight: 20 }
});
`,

  "src/screens/LoginScreen.tsx": `
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const [mobile, setMobile] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setUser = useStore(state => state.setUser);

  const handleSendOtp = () => {
    if (mobile.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  };

  const handleLogin = () => {
    if (otp.length < 4) return;
    setLoading(true);
    setTimeout(() => {
      setUser({ name: 'Srinivasan', mobile, mrn: 'MRN-987654321', doctor: 'Dr. Sarah Smith' });
      setLoading(false);
      navigation.replace('MainTabs');
    }, 1000);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#ffffff', '#f0f4f8']} style={StyleSheet.absoluteFillObject} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <MaterialCommunityIcons name="hospital-marker" size={60} color={theme.colors.primary} />
          <Text style={styles.title}>Bharathi Infinity</Text>
          <Text style={styles.subtitle}>Patient Portal</Text>
        </View>

        <View style={styles.card}>
          {!otpSent ? (
            <>
              <Text style={styles.instruction}>Enter mobile number to login</Text>
              <TextInput
                label="Mobile Number"
                value={mobile}
                onChangeText={setMobile}
                keyboardType="phone-pad"
                mode="outlined"
                style={styles.input}
                outlineColor="#E2E8F0"
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="phone" color={theme.colors.primary} />}
              />
              <Button 
                mode="contained" 
                onPress={handleSendOtp} 
                style={styles.button}
                contentStyle={{ height: 55 }}
                disabled={mobile.length < 10 || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <Text style={styles.instruction}>Enter OTP sent to +91 {mobile}</Text>
              <TextInput
                label="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                maxLength={4}
                outlineColor="#E2E8F0"
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
              />
              <Button 
                mode="contained" 
                onPress={handleLogin} 
                style={styles.button}
                contentStyle={{ height: 55 }}
                disabled={otp.length < 4 || loading}
              >
                {loading ? <ActivityIndicator color="#fff" /> : "Verify & Login"}
              </Button>
              <TouchableOpacity onPress={() => setOtpSent(false)} style={styles.backButton}>
                <Text style={styles.backText}>Change Mobile Number</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.colors.primary, marginTop: 10 },
  subtitle: { fontSize: 16, color: '#718096' },
  card: {
    backgroundColor: theme.colors.surface,
    padding: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  instruction: { fontSize: 16, color: '#4A5568', marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 20, backgroundColor: '#fff' },
  button: { borderRadius: 12, backgroundColor: theme.colors.primary },
  backButton: { marginTop: 20, alignItems: 'center' },
  backText: { color: theme.colors.accent, fontWeight: '600' }
});
`,

  "src/screens/DashboardScreen.tsx": `
import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useStore(state => state.user);
  const isDoctorApprovalPending = useStore(state => state.isDoctorApprovalPending);
  const cartCount = useStore(state => state.cart.length);
  const notificationCount = useStore(state => state.notifications.filter(n => !n.read).length);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.accent]} style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.welcome}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name}</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.iconBtn}>
              <MaterialCommunityIcons name="bell-outline" size={24} color="#fff" />
              {notificationCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{notificationCount}</Text></View>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Cart' as any)} style={styles.iconBtn}>
              <MaterialCommunityIcons name="cart-outline" size={24} color="#fff" />
              {cartCount > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cartCount}</Text></View>}
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.patientCard}>
          <View style={styles.patientInfoRow}>
            <MaterialCommunityIcons name="identifier" size={20} color={theme.colors.primary} />
            <Text style={styles.patientInfoText}>{user?.mrn}</Text>
          </View>
          <View style={styles.patientInfoRow}>
            <MaterialCommunityIcons name="doctor" size={20} color={theme.colors.primary} />
            <Text style={styles.patientInfoText}>{user?.doctor}</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('Search' as any)}>
            <View style={[styles.actionIcon, { backgroundColor: '#EBF4FF' }]}>
              <MaterialCommunityIcons name="pill" size={32} color="#3182CE" />
            </View>
            <Text style={styles.actionText}>Search Medicines</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={() => navigation.navigate('UploadPrescription')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E6FFFA' }]}>
              <MaterialCommunityIcons name="file-document-edit-outline" size={32} color="#38B2AC" />
            </View>
            <Text style={styles.actionText}>Upload Prescription</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Status Overview</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <MaterialCommunityIcons 
              name={isDoctorApprovalPending ? "clock-outline" : "check-circle-outline"} 
              size={32} 
              color={isDoctorApprovalPending ? theme.colors.pending : theme.colors.success} 
            />
          </View>
          <View style={styles.statusTextContainer}>
            <Text style={styles.statusTitle}>
              {isDoctorApprovalPending ? 'Approval Pending' : 'All Approved'}
            </Text>
            <Text style={styles.statusDesc}>
              {isDoctorApprovalPending 
                ? 'Your recent prescription is under review by doctor.' 
                : 'You have no pending approvals.'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, paddingTop: 50, paddingBottom: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  welcome: { color: 'rgba(255,255,255,0.8)', fontSize: 16 },
  name: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerIcons: { flexDirection: 'row', gap: 15 },
  iconBtn: { position: 'relative', padding: 5 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: theme.colors.error, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  patientCard: { backgroundColor: 'rgba(255,255,255,0.95)', padding: 15, borderRadius: 15, flexDirection: 'row', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  patientInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  patientInfoText: { color: theme.colors.text, fontWeight: '600' },
  content: { padding: 20, marginTop: -30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15, marginTop: 10 },
  actionsGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  actionCard: { flex: 1, backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  actionIcon: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  actionText: { fontWeight: '600', color: theme.colors.text, textAlign: 'center' },
  statusCard: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  statusIconContainer: { marginRight: 15 },
  statusTextContainer: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  statusDesc: { fontSize: 14, color: '#718096' }
});
`,

  "src/screens/SearchMedicinesScreen.tsx": `
import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Text, Searchbar, Button } from 'react-native-paper';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Medicine } from '../types';

export default function SearchMedicinesScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const medicines = useStore(state => state.medicines);
  const addToCart = useStore(state => state.addToCart);
  const cart = useStore(state => state.cart);

  const filteredMedicines = medicines.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Approved': return theme.colors.success;
      case 'Pending': return theme.colors.pending;
      case 'Rejected': return theme.colors.error;
      default: return theme.colors.text;
    }
  };

  const renderMedicine = ({ item }: { item: Medicine }) => {
    const inCart = cart.some(c => c.id === item.id);
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.medName}>{item.name}</Text>
            <Text style={styles.medCode}>{item.code} • {item.category}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
            <Text style={[styles.badgeText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.price}>₹{item.price}</Text>
          <Button 
            mode="contained" 
            onPress={() => addToCart(item)}
            disabled={inCart}
            style={[styles.addButton, inCart && { backgroundColor: '#E2E8F0' }]}
            labelStyle={inCart ? { color: '#718096' } : {}}
          >
            {inCart ? 'Added' : 'Add to Cart'}
          </Button>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search medicines, categories..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          inputStyle={styles.searchInput}
          iconColor={theme.colors.primary}
        />
      </View>
      
      <FlatList
        data={filteredMedicines}
        keyExtractor={item => item.id}
        renderItem={renderMedicine}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="pill" size={60} color="#CBD5E0" />
            <Text style={styles.emptyText}>No medicines found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  searchContainer: { padding: 15, backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  searchbar: { backgroundColor: '#F7FAFC', elevation: 0, borderRadius: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { fontSize: 15 },
  list: { padding: 15, gap: 15 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  medName: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text, marginBottom: 4 },
  medCode: { fontSize: 13, color: '#718096' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
  addButton: { borderRadius: 8, backgroundColor: theme.colors.primary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#A0AEC0' }
});
`,

  "src/screens/UploadPrescriptionScreen.tsx": `
import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

export default function UploadPrescriptionScreen() {
  const [uploaded, setUploaded] = useState(false);
  const navigation = useNavigation();
  const simulateDoctorApproval = useStore(state => state.simulateDoctorApproval);
  const addNotification = useStore(state => state.addNotification);

  const handleUpload = () => {
    setUploaded(true);
  };

  const handleSubmit = () => {
    simulateDoctorApproval();
    addNotification({
      title: 'Prescription Uploaded',
      message: 'Your prescription has been uploaded and is pending doctor approval.'
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Prescription</Text>
      <Text style={styles.subtitle}>Upload a clear image of your prescription for doctor approval before ordering.</Text>
      
      {!uploaded ? (
        <TouchableOpacity style={styles.uploadArea} onPress={handleUpload}>
          <View style={styles.uploadIconContainer}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Tap to Upload</Text>
          <Text style={styles.uploadSub}>Supports JPG, PNG (Max 5MB)</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="#A0AEC0" />
            <Text style={styles.fileName}>prescription_123.jpg</Text>
          </View>
          <TouchableOpacity onPress={() => setUploaded(false)} style={styles.removeBtn}>
            <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.timeline}>
        <Text style={styles.timelineTitle}>Approval Workflow</Text>
        <View style={styles.step}>
          <MaterialCommunityIcons name="check-circle" size={20} color={uploaded ? theme.colors.success : '#CBD5E0'} />
          <Text style={[styles.stepText, uploaded && { color: theme.colors.text }]}>1. Upload Prescription</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.step}>
          <MaterialCommunityIcons name="circle-outline" size={20} color="#CBD5E0" />
          <Text style={styles.stepText}>2. Under Doctor Review</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.step}>
          <MaterialCommunityIcons name="circle-outline" size={20} color="#CBD5E0" />
          <Text style={styles.stepText}>3. Approved / Rejected</Text>
        </View>
      </View>

      <Button 
        mode="contained" 
        onPress={handleSubmit} 
        disabled={!uploaded}
        style={styles.submitBtn}
        contentStyle={{ height: 55 }}
      >
        Submit for Approval
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#4A5568', marginBottom: 30, lineHeight: 22 },
  uploadArea: { borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 20, padding: 40, alignItems: 'center', backgroundColor: '#F7FAFC' },
  uploadIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  uploadTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 5 },
  uploadSub: { fontSize: 13, color: '#718096' },
  previewContainer: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  imagePlaceholder: { width: '100%', height: 150, backgroundColor: '#F7FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  fileName: { marginTop: 10, color: theme.colors.text, fontWeight: '600' },
  removeBtn: { position: 'absolute', top: 10, right: 10 },
  timeline: { marginTop: 40, backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16 },
  timelineTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepText: { fontSize: 15, color: '#A0AEC0', fontWeight: '500' },
  stepLine: { width: 2, height: 20, backgroundColor: '#E2E8F0', marginLeft: 9, marginVertical: 4 },
  submitBtn: { marginTop: 'auto', borderRadius: 12, backgroundColor: theme.colors.primary }
});
`,

  "src/screens/CartScreen.tsx": `
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
              onPress={() => navigation.navigate('Payment', { amount: total })}
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
`,

  "src/screens/PaymentScreen.tsx": `
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text, ActivityIndicator, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function PaymentScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const amount = route.params?.amount || 0;
  
  const [status, setStatus] = useState<'processing' | 'success'>('processing');
  const scaleAnim = new Animated.Value(0.5);
  
  const cart = useStore(state => state.cart);
  const clearCart = useStore(state => state.clearCart);
  const addOrder = useStore(state => state.addOrder);
  const addNotification = useStore(state => state.addNotification);

  useEffect(() => {
    // Simulate Razorpay mock payment flow
    const timer = setTimeout(() => {
      setStatus('success');
      
      const newOrder = {
        id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
        items: [...cart],
        total: amount,
        date: new Date().toISOString(),
        paymentStatus: 'Success' as const,
        approvalStatus: 'Approved' as const
      };
      
      addOrder(newOrder);
      clearCart();
      addNotification({
        title: 'Order Placed Successfully',
        message: \`Your order \${newOrder.id} has been placed. Amount paid: ₹\${amount}\`
      });
      
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true }).start();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {status === 'processing' ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.processingText}>Processing Payment...</Text>
          <Text style={styles.amountText}>Amount: ₹{amount}</Text>
          <Text style={styles.secureText}>
            <MaterialCommunityIcons name="shield-check" size={16} /> Secured by Razorpay Mock
          </Text>
        </View>
      ) : (
        <Animated.View style={[styles.successContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="check-bold" size={60} color="#fff" />
          </View>
          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSub}>Your order has been placed.</Text>
          
          <View style={styles.receipt}>
            <Text style={styles.receiptTitle}>Transaction Details</Text>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Amount Paid</Text>
              <Text style={styles.receiptValue}>₹{amount}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Payment Method</Text>
              <Text style={styles.receiptValue}>UPI</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>Status</Text>
              <Text style={[styles.receiptValue, { color: theme.colors.success }]}>Success</Text>
            </View>
          </View>
          
          <Button 
            mode="contained" 
            onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })}
            style={styles.doneBtn}
            contentStyle={{ height: 55 }}
          >
            Back to Dashboard
          </Button>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center', padding: 20 },
  processingContainer: { alignItems: 'center', backgroundColor: theme.colors.surface, padding: 40, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  processingText: { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginTop: 20, marginBottom: 10 },
  amountText: { fontSize: 18, color: '#4A5568', marginBottom: 20 },
  secureText: { fontSize: 14, color: '#718096' },
  successContainer: { alignItems: 'center', backgroundColor: theme.colors.surface, padding: 30, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  iconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: theme.colors.success, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 5 },
  successSub: { fontSize: 16, color: '#718096', marginBottom: 30 },
  receipt: { width: '100%', backgroundColor: '#F7FAFC', borderRadius: 12, padding: 20, marginBottom: 30 },
  receiptTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15 },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  receiptLabel: { color: '#4A5568', fontSize: 14 },
  receiptValue: { color: theme.colors.text, fontSize: 14, fontWeight: 'bold' },
  doneBtn: { width: '100%', borderRadius: 12, backgroundColor: theme.colors.primary }
});
`,

  "src/screens/OrderHistoryScreen.tsx": `
import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text } from 'react-native-paper';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Order } from '../types';

export default function OrderHistoryScreen() {
  const orders = useStore(state => state.orders);

  const renderOrder = ({ item }: { item: Order }) => {
    const date = new Date(item.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{item.id}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.paymentStatus}</Text>
          </View>
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.itemsList}>
          {item.items.map((cartItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName}>{cartItem.quantity}x {cartItem.name}</Text>
              <Text style={styles.itemPrice}>₹{cartItem.price * cartItem.quantity}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.footer}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalAmount}>₹{item.total}</Text>
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
            <MaterialCommunityIcons name="history" size={80} color="#CBD5E0" />
            <Text style={styles.emptyText}>No orders found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  list: { padding: 15, gap: 15 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 2 },
  date: { fontSize: 13, color: '#718096' },
  statusBadge: { backgroundColor: '#C6F6D5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: theme.colors.success },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 12 },
  itemsList: { gap: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 14, color: '#4A5568' },
  itemPrice: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: theme.colors.text },
  totalAmount: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 10, fontSize: 16, color: '#A0AEC0' }
});
`,

  "src/screens/ProfileScreen.tsx": `
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleLogout = () => {
    setUser(null);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const InfoRow = ({ icon, label, value }: { icon: string, label: string, value?: string }) => (
    <View style={styles.infoRow}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name={icon as any} size={24} color={theme.colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.accent]} style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.subtitle}>Patient Account</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Details</Text>
          <InfoRow icon="card-account-details-outline" label="Medical Record Number" value={user?.mrn} />
          <View style={styles.divider} />
          <InfoRow icon="phone-outline" label="Mobile Number" value={user?.mobile} />
          <View style={styles.divider} />
          <InfoRow icon="doctor" label="Primary Doctor" value={user?.doctor} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <Button 
            mode="text" 
            onPress={() => navigation.navigate('MainTabs', { screen: 'Orders' } as any)} 
            contentStyle={styles.linkBtnContent}
            labelStyle={styles.linkBtnLabel}
            icon="history"
          >
            Order History
          </Button>
          <Button 
            mode="text" 
            onPress={() => {}} 
            contentStyle={styles.linkBtnContent}
            labelStyle={styles.linkBtnLabel}
            icon="help-circle-outline"
          >
            Help & Support
          </Button>
        </View>

        <Button 
          mode="outlined" 
          onPress={handleLogout} 
          style={styles.logoutBtn}
          textColor={theme.colors.error}
          icon="logout"
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { alignItems: 'center', paddingVertical: 40, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  avatarContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  content: { padding: 20, marginTop: -20 },
  card: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.text, marginBottom: 15 },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F7FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: '#718096', marginBottom: 2 },
  infoValue: { fontSize: 16, color: theme.colors.text, fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 15 },
  linkBtnContent: { justifyContent: 'flex-start', paddingVertical: 8 },
  linkBtnLabel: { fontSize: 16, color: theme.colors.text },
  logoutBtn: { borderColor: theme.colors.error, borderWidth: 1, borderRadius: 12, marginTop: 10, paddingVertical: 5 }
});
`,

  "src/screens/NotificationsScreen.tsx": `
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
`,

  "src/navigation/AppNavigator.tsx": `
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { theme } from '../theme/theme';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SearchMedicinesScreen from '../screens/SearchMedicinesScreen';
import UploadPrescriptionScreen from '../screens/UploadPrescriptionScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import CartScreen from '../screens/CartScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainTabs: { screen?: string } | undefined;
  UploadPrescription: undefined;
  Notifications: undefined;
  Payment: { amount: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Search') iconName = focused ? 'magnify' : 'magnify';
          else if (route.name === 'Cart') iconName = focused ? 'cart' : 'cart-outline';
          else if (route.name === 'Orders') iconName = focused ? 'format-list-bulleted' : 'format-list-bulleted';
          else if (route.name === 'Profile') iconName = focused ? 'account' : 'account-outline';
          
          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#A0AEC0',
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Search" component={SearchMedicinesScreen} options={{ title: 'Medicines' }} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="UploadPrescription" component={UploadPrescriptionScreen} options={{ title: 'Upload Prescription' }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ title: 'Payment', headerBackVisible: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
`,

  "App.tsx": `
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { theme } from './src/theme/theme';

export default function App() {
  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppNavigator />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
`
};

for (const [filePath, content] of Object.entries(files)) {
  createFile(filePath, content);
  console.log("Created", filePath);
}
