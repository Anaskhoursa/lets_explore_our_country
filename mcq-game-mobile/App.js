import React from 'react';
import { View } from 'react-native'; // ✅ Removed StatusBar and SafeAreaView
import HomeScreen from './src/screens/homeScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HelloScreen from './src/screens/helloScreen';
import { useSocketStore } from './src/socketStore';
import GameScreen from './src/screens/gameScreen';
import HostScreen from './src/screens/hostScreen';
import { useFonts } from 'expo-font';
import { LogBox } from 'react-native';


export default function App() {
  const Stack = createNativeStackNavigator();
  const queryClient = new QueryClient();
  let [fontsLoaded] = useFonts({
    'Hacem': require('./assets/fonts/VIP-Cartoon-VIP-Cartoon.ttf'),
  });
  LogBox.ignoreLogs([
    'Text strings must be rendered',
    'Each child in a list should have a unique "key" prop.' // silence if needed
  ]);

  const { initSocket, connectSocket, disconnectSocket } = useSocketStore();

  const handleNavChange = (routeName) => {
    if (routeName === 'Home') {
      disconnectSocket();
    } else {
      connectSocket();
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer
        onStateChange={(state) => {
          const route = state.routes[state.index];
          handleNavChange(route.name);
        }}
        onReady={initSocket}
      >
        <View style={{ flex: 1 }}> {/* ✅ Replaced SafeAreaView */}
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Hello"
              component={HelloScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Game"
              component={GameScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Host"
              component={HostScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
