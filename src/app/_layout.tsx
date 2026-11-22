import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#f5f7f2' },
          headerTintColor: '#34442b',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            title: 'Home',
          }}
        />
        <Stack.Screen
          name="create-log"
          options={{ title: 'New Inspection Log', presentation: 'modal' }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}
