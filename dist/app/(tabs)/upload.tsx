import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator, Animated, Modal, TextInput } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import Dount from "@/components/ui/Donut";
import { SafeAreaView } from "react-native-safe-area-context";
import { Dimensions } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import Constants from "expo-constants";
import HOST from "@/constants/Host";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

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
  const [selectedOGImage, setSelectedOGImage] = useState<string | null>(null);
  const [aiPercent, setAiPercent] = useState<number>(0); // Default to 0 instead of null
  const [phrase, setPhrase] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false); // New state for loading screen
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [imageName, setImageName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);  


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

  const handleImage = async (uri: string) => {

    setSelectedOGImage(uri);
    setIsProcessing(true); // Start processing
    console.log("cat")

    const token = await AsyncStorage.getItem("token");
    if (!token) {
        alert("User not authenticated.");
        setIsUploading(false);
        return;
    }

    const decodedToken: any = jwtDecode(token);
    const userId = decodedToken.user_id;
    const formData = new FormData();
    formData.append("userId", userId.toString()); // Send the user ID
    formData.append("image", {
      uri: uri,
      type: "image/jpeg",
      name: `${imageName.trim()}.jpg`,
  } as any);
  
  try {
    const response = await axios.post(`${HOST}/analyze`, formData, {
      headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data", // Axios automatically sets the boundary for FormData
      },
      
  });

  console.log("response", response.data);

    const { confidenceScore, imageUrl } = response.data;
    setAiPercent(confidenceScore);
    setSelectedImage(imageUrl);

    const { phrase } = getCategoryAndPhrase(confidenceScore);
    setPhrase(phrase);

    setIsProcessing(false);
  } catch (error) {
    console.error("Error analyzing image:", error);
    alert("Error analyzing image.");
    setIsProcessing(false);
  }
    
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

  // Fun save image w confidence score and name, will manipulate later to contain heatmap and tie to user perchance
  const saveImage = async () => {
    if (!selectedImage || !imageName.trim()) {
        alert("Please enter an image name and select an image.");
        return;
    }

    setIsUploading(true);
    try {
        // Retrieve and decode the token so that the image gets tied to specific user
        const token = await AsyncStorage.getItem("token");
        if (!token) {
            alert("User not authenticated.");
            setIsUploading(false);
            return;
        }

        const decodedToken: any = jwtDecode(token);
        const userId = decodedToken.user_id;
        const formData = new FormData();
        formData.append("imageName", imageName.trim());
        formData.append("userId", userId.toString()); // Send the user ID
        formData.append("heatmap_uri", selectedImage); // Send the user ID
        formData.append("confidenceScore", aiPercent.toString());
        formData.append("image", {
            uri: selectedOGImage,
            type: "image/jpeg",
            name: `${imageName.trim()}.jpg`,
        } as any);



        
        const response = await fetch(`${HOST}/upload-test`, {
            method: "POST",
            body: formData,
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });

        const result = await response.json();
        if (result.success) {
            alert("Image and data uploaded successfully!");
            setAiPercent(result.probability);
            setSelectedImage(null);
        } else {
            console.error("Upload Failed:", result.error);
            alert("Upload failed: " + result.error);
        }
    } catch (error) {
        console.error("Upload error:", error);
        alert("Error uploading image.");
    } finally {
        setIsUploading(false);
    }
};
 
  return (
    <View className="flex-1 items-center bg-backgroundPrimary">
      {isProcessing || isUploading ? (
        // Loading Screen
        <View className="flex-1 w-full justify-center items-center bg-fontColorSecondary">
          <Text className="mb-4 text-2xl text-backgroundPrimary [font-family:'ClimateCrisis']">
          {isUploading ? "Uploading..." : "Preprocessing..."}</Text>
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
                      onPress={() => setIsModalVisible(true)}
                      className="bg-fontColorPrimary rounded-lg px-5 py-2 flex justify-center items-center"
                    >
                      <Text className="[font-family:'Inter'] text-white text-xl">Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </SafeAreaView>
            ) : (
              <></>

              // Modal for popup when saving the image
            )}
            {isModalVisible && (
            <Modal animationType="fade" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
              {/*Background*/}
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                {/*Content*/}
                <View style={{ backgroundColor: "white", padding: 30, borderRadius: 20, width: 350 }}>
                  <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10, textAlign: "left" }}>Enter Image Name</Text>

                  {/*Input section*/}
                  <TextInput
                    style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 5, marginBottom: 15 }}
                    value={imageName}
                    onChangeText={(text) => {
                      setImageName(text);
                      setErrorMessage(null);
                    }}
                  />
                  {/*Buttons*/}
                  <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
                    {/*Cancel button*/}
                    <TouchableOpacity
                      onPress={() => {
                        setIsModalVisible(false);
                        setErrorMessage(null);
                      }}
                      style={{ paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, width: 100, alignItems: "center"}}
                    >
                      <Text style={{ color: "#007AFF", fontSize: 16, fontWeight: "bold" }}>Cancel</Text>
                    </TouchableOpacity>
                    {/*Save button*/}
                    <TouchableOpacity
                      onPress={() => {
                        if (!imageName.trim()) {
                          setErrorMessage("Please enter a valid name for your image.");
                        } else {
                          setIsModalVisible(false);
                          saveImage();
                          setImageName("");
                          console.log("Image Name:", imageName);
                          setErrorMessage(null);
                        }
                      }}
                      style={{ backgroundColor: "#F15BB5", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5, width: 100, alignItems: "center" }}
                    >
                      <Text style={{ color: "white", fontSize: 16, fontWeight: "bold" }}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  {/*Error message*/}
                  {errorMessage && <Text style={{ color: "red", fontSize: 14, marginTop: 10, textAlign: "center" }}>{errorMessage}</Text>}
                </View>
              </View>
            </Modal>
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
