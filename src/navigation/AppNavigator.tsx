import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

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
import ChatbotScreen from '../screens/ChatbotScreen';
import RefundRequestScreen from '../screens/RefundRequestScreen';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  MainTabs: { screen?: string } | undefined;
  UploadPrescription: undefined;
  Notifications: undefined;
  Payment: { amount: number; items?: any[] };
  Chatbot: undefined;
  RefundRequest: { orderId: string; total: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const HeaderTitleWithLogo = ({ title, tintColor }: { title: string, tintColor?: string }) => (
  <View style={styles.headerTitleContainer}>
    <View style={styles.logoIconContainer}>
      <MaterialCommunityIcons name="heart-pulse" size={22} color={theme.colors.primary} />
    </View>
    <Text style={[styles.headerTitleText, { color: tintColor || '#fff' }]}>{title}</Text>
  </View>
);

const TabBackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity onPress={() => navigation.navigate('Dashboard' as never)} style={{ marginLeft: 15, marginRight: 5 }}>
      <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
    </TouchableOpacity>
  );
};

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
        headerTitleAlign: 'left',
        headerLeft: () => <TabBackButton />,
        tabBarStyle: { height: 60, paddingBottom: 10, paddingTop: 5, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0' }
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Search" component={SearchMedicinesScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Medicines" {...props} /> }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Cart" {...props} /> }} />
      <Tab.Screen name="Orders" component={OrderHistoryScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="History" {...props} /> }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Profile" {...props} /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#fff',
        headerTitleAlign: 'left',
      }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="UploadPrescription" component={UploadPrescriptionScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Upload Prescription" {...props} /> }} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Notifications" {...props} /> }} />
        <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Payment" {...props} />, headerBackVisible: false }} />
        <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Help & Support" {...props} /> }} />
        <Stack.Screen name="RefundRequest" component={RefundRequestScreen} options={{ headerTitle: (props) => <HeaderTitleWithLogo title="Raise Refund" {...props} /> }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitleText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});
