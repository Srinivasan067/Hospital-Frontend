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
