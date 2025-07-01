import React from 'react';
import { StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LocationProvider } from '@/hooks/useLocation';
import { BlurView } from 'expo-blur';
import { useImmersiveOverlay } from "@/components/immersive-overlay/store";
import { IconSymbol } from "@/components/ui/IconSymbol.ios";

export default function TabsLayout() {
  const { isOverlayOpen } = useImmersiveOverlay();
  return (
    <LocationProvider>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: '#d4af37',
          tabBarInactiveTintColor: 'white',

          // make header transparent so our BlurView shows through
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },

          // inject the BlurView behind header contents
          headerBackground: () => (
            <BlurView
              intensity={30}
              tint="systemChromeMaterialDark"
              style={styles.headerBlur}
            />
          ),

          tabBarStyle: {
            backgroundColor: '#1a5f3f',
            // borderTopColor: '#2d7a57',
            display: isOverlayOpen ? 'none' : 'flex',
          },
          tabBarIcon: ({ focused, color, size }) => {
            const nameMap: Record<string,string> = {
              'index':      focused ? 'clock.fill'     : 'clock',
              'ar-compass': focused ? 'safari.fill'   : 'safari',
              'compass':    focused ? 'mecca'  : 'mecca',
              'settings':   focused ? 'gearshape.fill' : 'gearshape',
            };
            return <IconSymbol name={nameMap[route.name]} size={size} color={color} />;
            // return <Ionicons name={nameMap[route.name]} size={size} color={color} />;
          },
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Prayer Times',
            headerTitle: '',
          }}
        />
        <Tabs.Screen name="ar-compass" options={{ title: 'AR Compass'  }} />
        <Tabs.Screen name="compass"    options={{ title: 'Compass'     }} />
        <Tabs.Screen name="settings"   options={{ title: 'Settings'    }} />
      </Tabs>
    </LocationProvider>
  );
}

const styles = StyleSheet.create({
  headerBlur: {
    ...StyleSheet.absoluteFillObject,
  },
});
