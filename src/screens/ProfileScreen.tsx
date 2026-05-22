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
            onPress={() => navigation.navigate('Chatbot' as any)} 
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
  header: { alignItems: 'center', paddingVertical: 20, paddingBottom: 30, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
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
