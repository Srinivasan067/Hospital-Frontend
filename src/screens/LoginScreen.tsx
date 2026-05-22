import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, HelperText } from 'react-native-paper';
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
  const [mobileError, setMobileError] = useState('');
  const [otpError, setOtpError] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const setUser = useStore(state => state.setUser);

  const handleSendOtp = () => {
    if (mobile.length !== 10) {
      setMobileError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setOtpSent(true);
      setLoading(false);
    }, 1000);
  };

  const handleLogin = () => {
    if (otp.length !== 4) {
      setOtpError('Please enter a valid 4-digit OTP.');
      return;
    }
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
                onChangeText={(text) => { setMobile(text); setMobileError(''); }}
                keyboardType="phone-pad"
                mode="outlined"
                style={[styles.input, { marginBottom: mobileError ? 0 : 20 }]}
                error={!!mobileError}
                outlineColor="#E2E8F0"
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="phone" color={theme.colors.primary} />}
              />
              {!!mobileError && (
                <HelperText type="error" visible={!!mobileError} style={{ marginBottom: 10 }}>
                  {mobileError}
                </HelperText>
              )}
              <Button
                mode="contained"
                onPress={handleSendOtp}
                style={styles.button}
                contentStyle={{ height: 55 }}
                buttonColor={theme.colors.primary}
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
                onChangeText={(text) => { setOtp(text); setOtpError(''); }}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { marginBottom: otpError ? 0 : 20 }]}
                maxLength={4}
                error={!!otpError}
                outlineColor="#E2E8F0"
                activeOutlineColor={theme.colors.primary}
                left={<TextInput.Icon icon="lock" color={theme.colors.primary} />}
              />
              {!!otpError && (
                <HelperText type="error" visible={!!otpError} style={{ marginBottom: 10 }}>
                  {otpError}
                </HelperText>
              )}
              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.button}
                contentStyle={{ height: 55 }}
                buttonColor={theme.colors.primary}
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
