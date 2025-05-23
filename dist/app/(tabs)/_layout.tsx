import { Tabs } from "expo-router";
import React from "react";
import { Platform, TouchableOpacity } from "react-native";
import { verifyInstallation } from "nativewind";
import { useColorScheme } from "@/hooks/useColorScheme";
import EvilIcons from "@expo/vector-icons/EvilIcons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Feather from "@expo/vector-icons/Feather";
import { COLORS } from "@/constants/Colors";


export const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 85 : 65;

// home indicator color can't be changed because apple sucks
// Tabs componeent doesnt use nativewind bc it also sucks so colors are maintained in Color.ts
export default function TabLayout() {
  const colorScheme = useColorScheme();
  ;

  verifyInstallation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarLabel: () => null,
        tabBarStyle: Platform.select({
          ios: {
            height: TAB_BAR_HEIGHT,
            justifyContent: "space-between", 
            bottom: 0 , 
            alignItems: 'center',
            paddingTop: 15, 
            backgroundColor: COLORS.backupColor,        
          },
          default: {
            justifyContent: 'center',            
            alignItems: 'center',         
      },
    }),
  }}
>
      <Tabs.Screen
        name="home"
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
        name="upload"
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
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <FontAwesome
              name="user"
              size={24}
              color={focused ? "white" : "rgba(255,255,255,0.6)"}
            />
          ),
        }}
      />
    </Tabs>
  );
}
