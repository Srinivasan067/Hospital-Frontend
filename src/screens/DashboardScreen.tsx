import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import { Text, Avatar, TextInput, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import { useStore } from '../store/useStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';

const FEED_POSTS = [
  {
    id: '1',
    title: 'A single blood donation can save 3 lives.',
    description: 'We successfully conducted a mega blood donation camp today. Thank you to all the 500+ donors who came forward! Your contribution is invaluable.',
    time: '2 hours ago',
    icon: 'water-plus-outline',
    bgColor: '#E53E3E',
    ctaText: 'Donate Now',
    ctaType: 'book',
  },
  {
    id: '2',
    title: 'Full Body Checkup at ₹999!',
    description: 'Special offer for this month! Get a comprehensive full body checkup including ECG, Lipid Profile, and 50+ parameters at an unbeatable price. Book your slot now.',
    time: '5 hours ago',
    icon: 'heart-pulse',
    bgColor: '#319795',
    ctaText: 'Book Checkup',
    ctaType: 'book',
  },
  {
    id: '3',
    title: 'Free ECG Screening Camp',
    description: 'Prioritize your heart health. Join our free ECG screening camp this weekend from 10 AM to 4 PM. Open for all senior citizens.',
    time: '1 day ago',
    icon: 'heart-outline',
    bgColor: '#DD6B20',
    ctaText: 'Call Helpline',
    ctaType: 'call',
  }
];

export default function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const user = useStore(state => state.user);
  const setUser = useStore(state => state.setUser);
  const isDoctorApprovalPending = useStore(state => state.isDoctorApprovalPending);
  const userPrescriptions = useStore(state => state.userPrescriptions);

  const cart = useStore(state => state.cart);
  const cartCount = cart.length;
  const notificationCount = useStore(state => state.notifications.filter(n => !n.read).length);

  // Cart summary logic
  const hasPendingItems = cart.some(item => item.status === 'Pending');
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + (cartCount > 0 ? 50 : 0);

  // Booking Modal State
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [bookName, setBookName] = useState(user?.name || '');
  const [bookMobile, setBookMobile] = useState(user?.mobile || '');

  const handleCTA = (post: any) => {
    if (post.ctaType === 'call') {
      Alert.alert('Calling Helpline', 'Dialing hospital helpline number...');
    } else if (post.ctaType === 'book') {
      setSelectedPost(post);
      setBookingModalVisible(true);
    }
  };

  const handleBookSubmit = () => {
    if (!bookName || !bookMobile) {
      Alert.alert('Error', 'Please fill in all details.');
      return;
    }
    setBookingModalVisible(false);
    Alert.alert('Success', `Your request for "${selectedPost.title}" has been submitted. Our team will contact you shortly.`);
  };

  React.useEffect(() => {
    (async () => {
      if (user && !user.location) {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setUser({ ...user, location: 'Location Denied' });
          return;
        }

        try {
          let location = await Location.getCurrentPositionAsync({});
          let geocode = await Location.reverseGeocodeAsync(location.coords);
          if (geocode.length > 0) {
            const { city, region, street } = geocode[0];
            const locString = [street, city, region].filter(Boolean).join(', ');
            setUser({ ...user, location: locString || 'Unknown Location' });
          } else {
            setUser({ ...user, location: 'Unknown Location' });
          }
        } catch (e) {
          setUser({ ...user, location: 'Location Error' });
        }
      }
    })();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.accent]} style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleArea}>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#fff" />
              <Text style={styles.locationText} numberOfLines={1}>{user?.location || 'Fetching location...'}</Text>
              <MaterialCommunityIcons name="chevron-down" size={16} color="#fff" />
            </View>
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
        {/* Pay Now Section - Shows only if items are in cart */}
        {cartCount > 0 && (
          <TouchableOpacity 
            style={styles.payNowCard}
            onPress={() => {
              if (hasPendingItems) {
                navigation.navigate('Cart' as any);
              } else {
                navigation.navigate('Payment', { amount: total, items: cart });
              }
            }}
          >
            <LinearGradient
              colors={hasPendingItems ? ['#F6AD55', '#DD6B20'] : ['#48BB78', '#38A169']}
              style={styles.payNowGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.payNowLeft}>
                <View style={styles.payNowIconContainer}>
                  <MaterialCommunityIcons 
                    name={hasPendingItems ? "cart-clock" : "credit-card-outline"} 
                    size={24} 
                    color="#fff" 
                  />
                </View>
                <View>
                  <Text style={styles.payNowTitle}>
                    {hasPendingItems ? 'Waiting for Approval' : 'Pay Now & Order'}
                  </Text>
                  <Text style={styles.payNowSubtitle}>
                    {cartCount} item{cartCount > 1 ? 's' : ''} • Total: ₹{total}
                  </Text>
                </View>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}

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
        <View style={styles.scenariosGrid}>
          {userPrescriptions.length === 0 ? (
            <View style={styles.scenarioCardSmall}>
              <Text style={styles.statusDescSmall}>No prescriptions yet.</Text>
            </View>
          ) : (
            userPrescriptions.map(rx => (
              <View key={rx.id} style={styles.scenarioCardSmall}>
                <View style={styles.scenarioHeaderSmall}>
                  <View style={[styles.statusIconSmall, { backgroundColor: rx.status === 'Under Review' ? '#FFF5F5' : rx.status === 'Approved' ? '#F0FFF4' : '#FFF5F5' }]}>
                    <MaterialCommunityIcons 
                      name={rx.status === 'Under Review' ? 'clock-outline' : rx.status === 'Approved' ? 'check-circle-outline' : 'close-circle-outline'} 
                      size={18} 
                      color={rx.status === 'Under Review' ? theme.colors.pending : rx.status === 'Approved' ? theme.colors.success : theme.colors.error} 
                    />
                  </View>
                  <Text style={styles.statusTitleSmall} numberOfLines={1}>{rx.status}</Text>
                </View>
                <Text style={styles.statusDescSmall} numberOfLines={2}>{rx.name}</Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Hospital Feed</Text>
        <View style={styles.feedContainer}>
          {FEED_POSTS.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <Avatar.Icon size={36} icon="hospital-building" style={{ backgroundColor: theme.colors.primary }} color="#fff" />
                <View style={styles.postHeaderText}>
                  <Text style={styles.postAuthor}>City Hospital</Text>
                  <Text style={styles.postTime}>{post.time}</Text>
                </View>
                <MaterialCommunityIcons name="dots-horizontal" size={24} color="#A0AEC0" />
              </View>
              
              <View style={[styles.postBanner, { backgroundColor: post.bgColor }]}>
                <MaterialCommunityIcons name={post.icon as any} size={48} color="rgba(255,255,255,0.9)" style={styles.postBannerIcon} />
                <Text style={styles.postBannerText}>{post.title}</Text>
              </View>
              
              <View style={styles.postContent}>
                <Text style={styles.postDescription}>
                  <Text style={styles.postAuthorInline}>City Hospital </Text>
                  {post.description}
                </Text>

                <TouchableOpacity 
                  style={[styles.postCTA, { backgroundColor: post.ctaType === 'call' ? '#EDF2F7' : theme.colors.primary }]}
                  onPress={() => handleCTA(post)}
                >
                  <MaterialCommunityIcons 
                    name={post.ctaType === 'call' ? 'phone' : 'calendar-check'} 
                    size={18} 
                    color={post.ctaType === 'call' ? theme.colors.text : '#fff'} 
                  />
                  <Text style={[styles.postCTAText, { color: post.ctaType === 'call' ? theme.colors.text : '#fff' }]}>
                    {post.ctaText}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Booking Modal */}
      <Modal visible={bookingModalVisible} transparent animationType="slide" onRequestClose={() => setBookingModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book / Register</Text>
              <TouchableOpacity onPress={() => setBookingModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBanner}>
              <Text style={styles.modalBannerTitle}>{selectedPost?.title}</Text>
            </View>

            <View style={styles.modalBody}>
              <TextInput
                label="Full Name"
                value={bookName}
                onChangeText={setBookName}
                mode="outlined"
                style={styles.input}
                outlineColor="#E2E8F0"
                activeOutlineColor={theme.colors.primary}
              />
              <TextInput
                label="Mobile Number"
                value={bookMobile}
                onChangeText={setBookMobile}
                mode="outlined"
                keyboardType="phone-pad"
                style={styles.input}
                outlineColor="#E2E8F0"
                activeOutlineColor={theme.colors.primary}
              />
              <Button mode="contained" onPress={handleBookSubmit} style={styles.submitBtn} labelStyle={styles.submitBtnLabel}>
                Submit Details
              </Button>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: 20, paddingTop: 50, paddingBottom: 60, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitleArea: { flex: 1, paddingRight: 10 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 'bold' },
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
  scenariosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  scenarioCardSmall: { width: '48%', backgroundColor: theme.colors.surface, padding: 12, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  scenarioHeaderSmall: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  statusIconSmall: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  statusTitleSmall: { fontSize: 13, fontWeight: 'bold', color: theme.colors.text, flex: 1 },
  statusDescSmall: { fontSize: 11, color: '#718096', lineHeight: 16 },
  
  // Pay Now Styles
  payNowCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  payNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  payNowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  payNowIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  payNowTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  payNowSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginTop: 2,
  },
  
  feedContainer: { gap: 20, paddingBottom: 20 },
  postCard: { backgroundColor: theme.colors.surface, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  postHeader: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  postHeaderText: { flex: 1, marginLeft: 10 },
  postAuthor: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text },
  postTime: { fontSize: 11, color: '#A0AEC0', marginTop: 1 },
  postBanner: { width: '100%', height: 220, justifyContent: 'center', alignItems: 'center', padding: 20 },
  postBannerIcon: { marginBottom: 15 },
  postBannerText: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 },
  postContent: { padding: 15, paddingTop: 10 },
  postAuthorInline: { fontWeight: 'bold', color: theme.colors.text },
  postDescription: { fontSize: 13, color: '#4A5568', lineHeight: 20 },
  postCTA: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, paddingVertical: 10, borderRadius: 8 },
  postCTAText: { fontWeight: 'bold', fontSize: 14 },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { width: '100%', backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', elevation: 5 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.text },
  modalBanner: { backgroundColor: '#EBF4FF', padding: 15, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  modalBannerTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, textAlign: 'center' },
  modalBody: { padding: 15, gap: 12 },
  input: { backgroundColor: '#fff' },
  submitBtn: { marginTop: 10, borderRadius: 8, paddingVertical: 4 },
  submitBtnLabel: { fontSize: 16, fontWeight: 'bold' }
});
