import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  SafeAreaView,
} from "react-native";
import ViewShot from "react-native-view-shot"; // For capturing and sharing
import Feather from "@expo/vector-icons/Feather"; // For the share icon
import Donut from "@/components/ui/Donut"; // Correct import for Donut component
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native"; // For accessing route params and navigation
import Ionicons from "@expo/vector-icons/Ionicons"; // For the back arrow
import * as Sharing from "expo-sharing";

const screenWidth = Dimensions.get("window").width;

const ImageDetailsScreen = () => {
  type ImageDetailsRouteParams = {
    params: {
      key: string;
      name: string;
      path?: string;
      imageData: {
        file_path: string;
        file_path_heatmap: string;
        confidence_score: number;
      };
    };
  };

  const route = useRoute<RouteProp<ImageDetailsRouteParams, "params">>(); // Access route params
  const navigation = useNavigation(); // For navigation
  const { imageData } = route.params || {}; // Destructure image data from route params

  // Handle missing imageData
  useEffect(() => {
    if (!imageData) {
      console.error("No image data provided. Redirecting to home.");
      navigation.goBack(); // Navigate back if no image data is provided
    }
  }, [imageData]);

  // Animation references
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // ViewShot reference for capturing the screen
  const viewShotRef = useRef<ViewShot>(null);

  // AI confidence percentage and phrase
  const aiPercent = imageData?.confidence_score || 0;
  const phrase = aiPercent > 0.5 ? "AI-generated" : "real";

  // Function to capture and share the image
  const captureAndShare = async () => {
    try {
      const uri = await viewShotRef.current?.capture?.();
      if (uri) {
        await Sharing.shareAsync(uri);
      } else {
        console.warn("Capture failed or capture method is undefined.");
      }
    } catch (error) {
      console.error("Error capturing or sharing image:", error);
    }
  };

  // Start animations when the component mounts
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-backgroundPrimary">
      <View className="flex flex-row justify-between items-center px-6 pt-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="pr-3">
          <Ionicons name="arrow-back" size={28} color="#FFFFFF" />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "ClimateCrisis",
            fontSize: 32,
            color: "#21FA90",
          }}
        >
          Details
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Content */}
      <View className="flex-1">
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            marginTop: 20,
          }}
        >
          <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
            <View
              className={`flex flex-col items-center justify-between p-4 rounded-lg ${
                aiPercent > 0.5
                  ? "bg-fontColorPrimary"
                  : "bg-fontColorSecondary"
              }`}
            >
              {/* Display the main image */}
              <View className="w-full flex items-center mt-2 mb-2">
                <Image
                  source={{ uri: imageData.file_path_heatmap }}
                  style={{
                    width: "100%",
                    maxWidth: screenWidth * 0.9,
                    height: undefined,
                    aspectRatio: 1.5,
                    borderRadius: 10,
                  }}
                  resizeMode="contain"
                />
              </View>

              {/* AI Result & Share Button */}
              <View className="flex flex-row items-center justify-between w-full mt-2 px-2">
                {aiPercent !== null && phrase && (
                  <Text
                    className={`font-semibold [font-family:'Inter'] text-3xl ${
                      aiPercent > 0.5 ? "text-white" : "text-backupColor2"
                    }`}
                  >
                    {aiPercent > 0.5 ? "It's AI" : "It's real!"}
                  </Text>
                )}
                {aiPercent !== null && phrase && (
                  <TouchableOpacity
                    onPress={captureAndShare}
                    className={`p-3 rounded-lg flex-row justify-center items-center ${
                      aiPercent > 0.5
                        ? "bg-backupColor2"
                        : "bg-fontColorPrimary"
                    }`}
                  >
                    <Feather name="share" size={15} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Confidence Score */}
              <View className="w-full px-2">
                {aiPercent !== null && phrase && (
                  <Text className="text-2xl font-semibold text-backgroundPrimary [font-family:'Inter'] mt-3">
                    {`${
                      aiPercent > 0.5
                        ? (aiPercent * 100).toFixed(2)
                        : (100 * (1 - aiPercent)).toFixed(2)
                    }% ${phrase}`}
                  </Text>
                )}
                <Text className="text-1xl text-backgroundPrimary [font-family:'Inter'] mt-1">
                  based on the highlighted areas
                </Text>
              </View>

              {/* Donut Chart */}
              <View className="flex flex-row items-center mt-1">
                {aiPercent !== null && phrase && (
                  <Donut
                    AI={(aiPercent * 100).toFixed(2)}
                    notAI={(100 - aiPercent * 100).toFixed(2)}
                  />
                )}
              </View>
            </View>
          </ViewShot>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

export default ImageDetailsScreen;
