import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ImageBackground,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { TAB_BAR_HEIGHT } from "./_layout";
import { useRouter } from "expo-router";
import HOST from "@/constants/Host";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import Constants from "expo-constants";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const getImageHeight = (imageUrl: string, desiredWidth: number): Promise<number> => {
  return new Promise((resolve) => {
    if (typeof imageUrl === 'string') {
      Image.getSize(
        imageUrl,
        (width, height) => {
          // Calculate height while maintaining aspect ratio
          const aspectRatio = width / height;
          const calculatedHeight = desiredWidth / aspectRatio;
          resolve(calculatedHeight);
        },
        (error) => {
          console.error('Error getting image size:', error);
          resolve(200); // Fallback height
        }
      );
    } else {
      // For local images (using require)
      resolve(200); // Default height for local images
    }
  });
};

const fetchImageData = async () => {
  try {
    const token = await AsyncStorage.getItem("token");  //Retrieve JWT token
    if (!token) {
      console.error("No token found. User might not be logged in.");
      return;
    }
    const response = await axios.get(`${HOST}/images`, {
      headers: {
        "Authorization": `Bearer ${token}`,  
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching image data:", error);
  }
};

// example images
const defaultImages = [
  { image_id: 1, file_path: require("@/assets/images/A.jpg"), confidence_score: "95" },
  { image_id: 2, file_path: require("@/assets/images/B.png"), confidence_score: "10" },
  { image_id: 3, file_path: require("@/assets/images/C.jpg"), confidence_score: "10" },
  { image_id: 4, file_path: require("@/assets/images/D.png"), confidence_score: "10" },
  { image_id: 5, file_path: require("@/assets/images/E.jpg"), confidence_score: "10" },
  { image_id: 6, file_path: require("@/assets/images/F.jpg"), confidence_score: "10" },
  // Add more images as needed
];

const App = () => {

  const [images, setImages] = useState(defaultImages);

  const [userFirstName, setUserFirstName] = useState("User");

  // Function to fetch updated images when navigating back
  useFocusEffect(
    useCallback(() => {
      const fetchUpdatedImages = async () => {
        try {
          const data = await fetchImageData();
          if (data && data.images) {
            setImages(data.images);
          }
        } catch (error) {
          console.error("Error fetching updated images:", error);
        }
      };
      fetchUpdatedImages();
    }, [])
  );

  // Used to grab users first name and display on the top of the home page, based on the id that is logged in
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
        if (decodedToken.first_name) {
          setUserFirstName(decodedToken.first_name);
        } else {
          console.error("first_name not found in token.");
        }
      } catch (error) {
        console.error("Error extracting user first name:", error);
      }
    };
  
    getUserFirstName();
  }, []);
  
  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await fetchImageData();
        if (data && data.images) {
          setImages(data.images);
        } else {
          console.error("No images found.");
          setImages([]); // stays empty if no images exist
        }
      } catch (error) {
        console.error("Error loading images:", error);
      }
    };

    loadImages();
  }, []);
  
  const distributeImages = (images: any) => {
    const thinCards: any = [];
    const thickCards: any = [];
  
    images.forEach((image: any, index: any) => {
      if (index % 2 === 0) {
        thinCards.push(image);
      } else {
        thickCards.push(image);
      }
    });
  
    return { thinCards, thickCards };
  };
  
  const { thinCards, thickCards } = distributeImages(images);

  const router = useRouter();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-backgroundPrimary">
      {/* Header */}
      <View className=" flex flex-row justify-between items-center px-6 pt-6">
        <Text className="text-4xl [font-family:'ClimateCrisis'] text-fontColorPrimary">
          AIDA
        </Text>
        {/* Show user’s first name */}
        <View className="flex items-end">
          <Text className="text-white text-2xl [font-family:'Inter'] font-bold">
            Welcome, {userFirstName}!
          </Text>
          <Text className="text-white text-2xl [font-family:'Inter'] font-bold ">
            Gallery
          </Text>
        </View>
      </View>
      <View className=" h-[0.25px] bg-backgroundPrimary my-2"></View>

      {/* Masonry Layout / No Images Message */}
      <View className="flex-1">
        {images.length === 0 ? (
          // Show this when no images are found
          <View className="flex-1 justify-center items-center">
            <Text className="text-white text-2xl [font-family:'Inter'] font-bold">
              Start testing to fill your gallery!
            </Text>
          </View>
        ) : (
          // Show gallery if images exist
          <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}>
            <View className="flex flex-row justify-between mx-4">
              <View className="flex flex-col">
                {thinCards.map((image: any) => (
                  <ThinCard
                    key={image.image_id}
                    label={image.confidence_score}
                    isChecked={true}
                    imageUrl={image.file_path}
                  />
                ))}
              </View>
              <View className="flex flex-col">
                {thickCards.map((image: any) => (
                  <ThickCard
                    key={image.image_id}
                    label={image.confidence_score}
                    imageUrl={image.file_path}
                  />
                ))}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

// @ts-ignore
const ThinCard = ({ label, isChecked, imageUrl }) => {
  const [imageHeight, setImageHeight] = useState<number | null>(null)

  useEffect(() => {
    getImageHeight(imageUrl, 150).then((height) => {
      setImageHeight(height);
    });
  }, [imageUrl]);

  
  return (
    <ImageBackground
      source={{ uri : imageUrl }}
      style={{ height:  imageHeight}}
      imageStyle={{ borderRadius: 10 }}
      className=" rounded-lg m-1.5 w-40 flex justify-end items-end"
    >
      <View
        className={`${label > 0.50
            ? "bg-fontColorPrimary text-white"
            : " bg-fontColorSecondary text-backgroundPrimary"
          } py-1 px-2 rounded-md flex flex-row justify-between items-center`}
      >
        {label > 0.50 ? <Ionicons name="checkmark-sharp" size={14} color="white" /> : <FontAwesome6 name="xmark" size={14} />}
        <Text className={`ml-2 ${label > 0.5 ? "text-white" : "text-backgroundPrimary"}`}>
          {label * 100}% AI
        </Text>
      </View>
    </ImageBackground>
  );
};

// @ts-ignore
const ThickCard = ({ label, imageUrl }) => {
  const [imageHeight, setImageHeight] = useState<number | null>(null)

  useEffect(() => {
    getImageHeight(imageUrl, 150).then((height) => {
      setImageHeight(height);
    });
  }, [imageUrl]);

  return (
    <View>
      <ImageBackground
        source={{ uri : imageUrl }}
        style={{ height: imageHeight }}
        imageStyle={{ borderRadius: 10 }}
        className="rounded-lg m-4 w-56 flex justify-end items-end"
      >
        <View
          className={`${label > 0.50
              ? "bg-fontColorPrimary text-white"
              : " bg-fontColorSecondary text-backgroundPrimary"
            } py-1 px-2 rounded-md flex flex-row justify-between items-center`}
        >
          {label > 0.50 ? <Ionicons name="checkmark-sharp" size={14} color="white" /> : <FontAwesome6 name="xmark" size={14} />}
          <Text className={`ml-2 ${label > 0.50 ? "text-white" : "text-backgroundPrimary"}`}>
            {label * 100}%
            AI
          </Text>

        </View>
      </ImageBackground>
    </View>
  );
};

export default App;
