import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import HOST from "@/constants/Host";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons"; // Import Ionicons for the delete icon
import { Alert } from "react-native"; // Import Alert from React Native

// Type for images
interface ImageData {
  image_id: number;
  file_path_heatmap: string;
  file_path: string;
  file_name: string; // Added file_name property
  confidence_score: number; // Added confidence_score property
}

type RootStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [userFirstName, setUserFirstName] = useState("User"); // Initialize with "User"

  useEffect(() => {
    const getUserFirstName = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        // Decode JWT token to get first_name
        const decodedToken: any = jwtDecode(token);
        console.log("Decoded token:", decodedToken); // Debugging

        if (decodedToken && decodedToken.first_name) {
          setUserFirstName(decodedToken.first_name); // Update state with first name
          setUsername(decodedToken.username); 
          setEmail(decodedToken.email);
        } else {
          console.error("first_name not found in token.");
        }
      } catch (error) {
        console.error("Error extracting user first name:", error);
      }
    };

    getUserFirstName();
  }, []);

  // Function to fetch user's saved images
  const fetchUserImages = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
      console.log("Fetching images from:", `${HOST}/images`); // Debugging log
      const response = await axios.get(`${HOST}/images`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.images) {
        setImages(response.data.images);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };
  const confirmDeleteImage = (imageId: number) => {
    Alert.alert(
      "Delete Image",
      "Are you sure you want to delete this image? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => handleDeleteImage(imageId), // Call the delete function if confirmed
        },
      ]
    );
  };
  
  const handleDeleteImage = async (imageId: number) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        console.error("No token found");
        return;
      }
  
      console.log(`Deleting image with ID: ${imageId}`); // Debugging log
      const response = await axios.delete(`${HOST}/images/${imageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.data.success) {
        console.log("Image deleted successfully");
        // Remove the deleted image from the state
        setImages((prevImages) => prevImages.filter((image) => image.image_id !== imageId));
      } else {
        console.error("Failed to delete image:", response.data.error);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchUserImages();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-backgroundPrimary">
      {/* Header */}
            <View className="flex flex-row justify-between items-center px-6 pt-6">
              <Text className="text-4xl [font-family:'ClimateCrisis'] text-fontColorPrimary">
                AIDA
              </Text>
              <View className="flex items-end">
                <Text className="text-backgroundSecondary text-xl [font-family:'Inter'] font-light">
                Welcome, {userFirstName}!
                </Text>
                <Text className="text-white text-2xl [font-family:'Inter'] font-bold">
                  Profile
                </Text>
              </View>
            </View>

      {/* User Details */}
      <View className="px-6 pb-6">
        <Text className="text-xl text-backupColor2 font-bold">Username: <Text className="text-white font-light">{username}</Text></Text>
        <Text className="text-xl text-backupColor2 font-bold">Email: <Text className="text-white font-light">{email}</Text></Text>
      </View>

      {/* Saved Images Section */}
      <View className="px-6">
        <Text className="text-xl text-white mb-2">Saved Images</Text>
      </View>

      {/* Scrollable List of Images */}
      <ScrollView className="px-6">
  {images.map((image) => (
    <View key={image.image_id} className="mb-4 bg-backgroundSecondary p-3 rounded-lg">
      <Text className="text-white text-lg mb-2">{image.file_name}: {image.confidence_score * 100}% AI</Text>
      <View className="flex-row items-center">
        <Image source={{ uri: image.file_path }} className="w-40 h-40 rounded-lg mr-4" />
        <Image source={{ uri: image.file_path_heatmap }} className="w-40 h-40 rounded-lg" />
        <TouchableOpacity
          onPress={() => confirmDeleteImage(image.image_id)} // Use the confirmation function
          className="ml-4"
        >
          <Ionicons name="trash-outline" size={24} color="#F15BB5" />
        </TouchableOpacity>
      </View>
    </View>
  ))}
</ScrollView>
    </SafeAreaView>
  );
}
