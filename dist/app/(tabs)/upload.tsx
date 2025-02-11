import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Animated } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import Dount from "@/components/ui/Donut";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";

const logo = require("@/assets/images/logo.png");
const screenWidth = Dimensions.get("window").width;

export default function UploadScreen() {
  const viewShotRef = useRef<ViewShot>(null);

  const phrases = {
    "0.0-0.4": ["not a bot", "touched by humans", "no funny business"],
    "0.4-0.6": ["mostly the real deal", "suspiciously off"],
    "0.6-0.8": ["a little sus", "non-human-ish"],
    "0.8-1.0": ["bot expressionism", "untouched by humans"],
  };

  const getCategoryAndPhrase = (probability: number) => {
    let category: keyof typeof phrases;
    if (probability <= 0.4) category = "0.0-0.4";
    else if (probability <= 0.6) category = "0.4-0.6";
    else if (probability <= 0.8) category = "0.6-0.8";
    else category = "0.8-1.0";

    const randomPhrase = phrases[category][Math.floor(Math.random() * phrases[category].length)];
    return { category, phrase: randomPhrase };
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [aiPercent, setAiPercent] = useState<number>(0); // Default to 0 instead of null
  const [phrase, setPhrase] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // New state for loading screen

  const takeImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera permissions!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    // @ts-ignore
    handleImage(result.assets[0].uri);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });

    // @ts-ignore
    handleImage(result.assets[0].uri);
  };
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!isProcessing) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0, // Move to original position
          duration: 900, 
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isProcessing]); // Run only when selectedImage changes

  const handleImage = (uri: string) => {
    setSelectedImage(uri);
    setIsProcessing(true); // Start processing

    // Simulate processing delay (e.g., 3 seconds)
    setTimeout(() => {
      // TEMP: Generate a random AI probability (replace with actual computed value later)
      const randomProbability = Math.random();
      setAiPercent(randomProbability);

      // Get category and phrase
      const { phrase } = getCategoryAndPhrase(randomProbability);
      setPhrase(phrase);

      setIsProcessing(false); // End processing
    }, 3000); // Simulate a 3-second delay
  };

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

  return (
    <View className="flex-1 items-center bg-backgroundPrimary">
      {isProcessing ? (
        // Loading Screen
        <View className="flex-1 w-full justify-center items-center bg-fontColorSecondary">
          <Text className="mb-4 text-2xl text-backgroundPrimary [font-family:'ClimateCrisis']">Preprocessing...</Text>
          <ActivityIndicator size="large" color="backgroundPrimary" />
          <Image source={logo} className="rounded-lg  w-[75.4px] h-[70px] mt-10" />
        </View>
      ) : (
        // Main Content
        <>
          <View className="flex flex-row">
            {selectedImage && selectedImage != logo ? (
              <SafeAreaView className="flex-1 bg-backgroundPrimary">
                <View className="flex flex-row justify-between items-center px-6 pt-6">
                  <Text className="[font-family:'ClimateCrisis'] text-4xl text-fontColorSecondary">
                    Results
                  </Text>
                  <View className="flex flex-row items-center">
                    <TouchableOpacity
                      onPress={() => setSelectedImage(null)}
                      className="pr-3 rounded-lg flex-row items-center"
                    >
                      <Text className="text-backgroundSecondary [font-family:'Inter'] underline text-xl pr-2">
                        Discard
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setSelectedImage(null)}
                      className="bg-fontColorPrimary rounded-lg px-5 py-2 flex justify-center items-center"
                    >
                      <Text className="[font-family:'Inter'] text-white text-xl">Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            ) : (
              <></>
            )}
          </View>
          <View>
            {selectedImage ? (
              <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                <ViewShot ref={viewShotRef} options={{ format: "png", quality: 0.9 }}>
                  <View
                    className={`flex flex-col items-center justify-between p-4 rounded-lg ${aiPercent > 0.5 ? "bg-fontColorPrimary" : "bg-fontColorSecondary"
                      }`}
                  >
                    <View className="w-full flex items-center mt-2 mb-2">
                      <Image
                        source={{ uri: selectedImage }}
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
                    {/* AI Result & share Button */}
                    <View className="flex flex-row items-center justify-between w-full mt-2 px-2">
                      {aiPercent !== null && phrase && (
                        <Text
                          className={`font-semibold [font-family:'Inter'] text-3xl ${aiPercent > 0.5 ? "text-white" : "text-backupColor2"
                            }`}
                        >
                          {aiPercent > 0.5 ? "It's AI" : "It's real!"}
                        </Text>
                      )}
                      {aiPercent !== null && phrase && (
                        <TouchableOpacity
                          onPress={captureAndShare}
                          className={`p-3 rounded-lg flex-row justify-center items-center ${aiPercent > 0.5 ? "bg-backupColor2" : "bg-fontColorPrimary"
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
                          {`${aiPercent > 0.5 ? (aiPercent * 100).toFixed(2) : (100 * (1 - aiPercent)).toFixed(2)}% ${phrase}`}
                        </Text>
                      )}
                      <Text className="text-1xl text-backgroundPrimary [font-family:'Inter'] mt-1">
                        based on the highlighted areas
                      </Text>
                    </View>
                    {/* Donut Chart */}
                    <View className="flex flex-row items-center mt-1">
                      {aiPercent !== null && phrase && (
                        <Dount AI={(aiPercent * 100).toFixed(2)} notAI={(100 - aiPercent * 100).toFixed(2)} />
                      )}
                    </View>
                  </View>
                </ViewShot>
              </Animated.View>
            ) : (
              <>
                <SafeAreaView className="flex-1 bg-backgroundPrimary">
                  <View className="flex flex-row justify-between items-center px-6 pt-6">
                    <Text className="text-4xl [font-family:'ClimateCrisis'] text-fontColorSecondary">
                      Upload Image
                    </Text>
                  </View>
                  <View className="h-[0.25px] bg-backgroundPrimary my-4"></View>
                  {/* Instruction Box */}
                  <View className="bg-backupColor2 rounded-lg p-6 mt-20 mb-5 w-[350px]">
                    <Text className="text-white text-1xl [font-family:'Inter'] text-center">
                      For best results, upload high-quality images with clear details. Avoid blurry or
                      distorted images to ensure accurate detection.
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View className="flex flex-col items-center justify-center h-[50%]">
                    <TouchableOpacity
                      onPress={takeImage}
                      className="bg-fontColorPrimary p-4 rounded-lg flex-row mt-6 items-center"
                    >
                      <Text className="text-white text-1xl pr-2">Take Photo</Text>
                      <Feather name="camera" size={24} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={pickImage}
                      className="bg-fontColorPrimary p-4 rounded-lg flex-row mt-6 items-center"
                    >
                      <Text className="text-white text-1xl pr-2">Upload from Library</Text>
                      <Feather name="upload" size={24} color="white" />
                    </TouchableOpacity>
                  </View>
                </SafeAreaView>
              </>
            )}
          </View>
        </>
      )}
    </View>
  );
}
