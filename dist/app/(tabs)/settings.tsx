import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-backgroundPrimary">
      {/*Header*/}
      <View className="p-6">
        <Text className="text-4xl [font-family:'ClimateCrisis'] text-backupColor2">Settings</Text>
      </View>

      {/*Settings options*/}
      <ScrollView className="px-6">
        {/* Examples for now I supposeeeee kinda jus placeholders*/}
        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-700">
          <Text className="text-xl text-white">Theme</Text>
          <MaterialCommunityIcons name="palette" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-700">
          <Text className="text-xl text-white">Notifications</Text>
          <Feather name="bell" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-700">
          <Text className="text-xl text-white">Language</Text>
          <Feather name="globe" size={24} color="white" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-between py-4 border-b border-gray-700">
          <Text className="text-xl text-red-500">Logout</Text>
          <Feather name="log-out" size={24} color="red" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
