import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AppRoutes from './src/navigation/AppRoutes';

export default function App() {
  return (
    <NavigationContainer>
      <AppRoutes />
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
