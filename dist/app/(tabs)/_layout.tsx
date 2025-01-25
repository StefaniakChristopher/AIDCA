import { Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { verifyInstallation } from "nativewind";
import { useColorScheme } from "@/hooks/useColorScheme";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import Feather from "@expo/vector-icons/Feather";
import { COLORS } from "@/constants/Colors";

// home indicator color can't be changed because apple sucks
export default function TabLayout() {
  const colorScheme = useColorScheme();

  verifyInstallation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabel: () => null,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            justifyContent: "space-between", 
            flex: 1,   
            alignItems: 'center',
            paddingTop: 15, 
            backgroundColor: COLORS.backupColor,     
            safeAreaInsets: { bottom: 0 },    
          },
          default: {
            justifyContent: 'center',            
            alignItems: 'center',         
      },
    }),
  }}
>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="home"
              size={24}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Feather
              name="crosshair"
              size={24}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <EvilIcons
              name="gear"
              size={28}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
