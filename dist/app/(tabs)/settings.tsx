import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Settings = () => {
  // State for settings
  const [galleryLimit, setGalleryLimit] = useState(20); // Default to 20
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
  const router = useRouter();
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // Handlers
  const handleGalleryLimitChange = (value: number) => {
    setGalleryLimit(Math.round(value));
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    // Add logic here to switch theme globally if implemented
  };

  const handleDeleteCloudImages = () => {
    // Placeholder for cloud deletion logic
    console.log("Deleting images from cloud...");
    alert("Cloud images deleted (placeholder)");
  };
  // Confirmatiopn + log out logic
  const confirmLogout = async () => {
    try {
      await AsyncStorage.removeItem("token"); // Remove JWT token
      setIsLogoutModalVisible(false); // Close modal
      router.replace("/"); // Redirect to landing page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-backgroundPrimary">
      {/* Header */}
      <View className="flex flex-row justify-between items-center px-6 pt-6">
        <Text className="text-4xl [font-family:'ClimateCrisis'] text-fontColorPrimary">
          AIDA
        </Text>
        <View className="flex items-end">
          <Text className="text-backgroundSecondary text-xl [font-family:'Inter'] font-light">
            Welcome, User!
          </Text>
          <Text className="text-white text-2xl [font-family:'Inter'] font-bold">
            Settings
          </Text>
        </View>
      </View>
      <View className="h-[0.25px] bg-backgroundPrimary my-2" />

      {/* Settings Content */}
      <View className="flex-1 px-6 py-4">
        {/* Gallery Storage Slider */}
        <View className="mb-6">
          <Text className="text-white text-lg [font-family:'Inter'] font-medium mb-2">
            Gallery Storage Limit
          </Text>
          <Slider
            style={{ width: "100%", height: 40 }}
            minimumValue={20}
            maximumValue={51}
            step={1}
            value={galleryLimit}
            onValueChange={handleGalleryLimitChange}
            minimumTrackTintColor="#FFD700"
            maximumTrackTintColor="#555"
            thumbTintColor="#FFD700"
          />
          <Text className="text-backgroundSecondary text-base [font-family:'Inter'] font-bold mt-1 text-center">
            {galleryLimit > 50 ? "Unlimited" : `${galleryLimit} images`}
          </Text>
        </View>

        {/* Light/Dark Mode Toggle */}
        <View className="flex flex-row justify-between items-center mb-6">
          <Text className="text-white text-lg [font-family:'Inter'] font-medium">
            {isDarkMode ? "Dark Mode" : "Light Mode"}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: "#767577", true: "#FFD700" }}
            thumbColor={isDarkMode ? "#FFD700" : "#f4f3f4"}
          />
        </View>

        {/* Delete Cloud Images */}
        <TouchableOpacity
          onPress={handleDeleteCloudImages}
          className="flex flex-row items-center mb-6"
        >
          <Ionicons name="cloud-offline-outline" size={24} color="#FFD700" />
          <Text className="text-white text-lg [font-family:'Inter'] font-medium ml-3">
            Delete Cloud Images
          </Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          onPress={() => setIsLogoutModalVisible(true)}
          className="flex flex-row items-center"
        >
          <Ionicons name="log-out-outline" size={24} color="#FFD700" />
          <Text className="text-white text-lg [font-family:'Inter'] font-medium ml-3">
            Log Out
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Confirmation Modal */}
      {isLogoutModalVisible && (
        <Modal animationType="fade" transparent visible={isLogoutModalVisible} onRequestClose={() => setIsLogoutModalVisible(false)}>
          {/* Background */}
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            {/* Modal Content */}
            <View style={{ backgroundColor: "white", padding: 30, borderRadius: 20, width: 350 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "left" }}>Confirm Logout</Text>
              <Text style={{ fontSize: 16, marginBottom: 20, textAlign: "left" }}>Are you sure you want to log out?</Text>

              {/* Buttons */}
              <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                {/* Cancel Button */}
                <TouchableOpacity
                  onPress={() => setIsLogoutModalVisible(false)}
                  style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, width: 100, alignItems: "center" }}
                >
                  <Text style={{ color: "#007AFF", fontSize: 16, fontWeight: "bold" }}>Cancel</Text>
                </TouchableOpacity>

                {/* Confirm Logout Button */}
                <TouchableOpacity
                  onPress={confirmLogout}
                  style={{ backgroundColor: "#F15BB5", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, width: 100, alignItems: "center" }}
                >
                  <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Settings;
