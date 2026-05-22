import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
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
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#ffffff', '#e6e9f0', '#dcd9f8']} style={StyleSheet.absoluteFillObject} />
      <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.iconContainer}>
          <Image source={require('../../logo.jpg')} style={styles.logoImage} resizeMode="contain" />
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
  logoImage: {
    width: 100, height: 100
  },
  subIcon: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 2 },
  title: { fontSize: 32, fontWeight: 'bold', color: theme.colors.primary, letterSpacing: 1 },
  subtitle: { fontSize: 28, fontWeight: '300', color: theme.colors.primary, marginBottom: 20 },
  divider: { width: 50, height: 3, backgroundColor: theme.colors.accent, borderRadius: 2, marginBottom: 20 },
  tagline: { fontSize: 14, color: '#4A5568', textAlign: 'center', maxWidth: 250, lineHeight: 20 }
});
