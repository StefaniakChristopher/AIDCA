import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Feather from "@expo/vector-icons/Feather";
import { useState } from "react";
import Dount from "@/components/ui/Donut";


const logo = require("@/assets/images/logo.png");

export default function UploadScreen() {
  // @ts-ignore
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAI, setIsAI] = useState(false);
  const [aiPercent, setAiPercent] = useState(12);

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

  // @ts-ignore
  const handleImage = (uri) => {
    const blob = new Blob([uri], { type: "image/jpeg" });

    setSelectedImage(uri);
  };
  

  return (
    <View className="flex-1 items-center justify-center bg-backgroundPrimary p-4">
      <View className=" flex flex-row w-[400px]">
        {selectedImage && selectedImage != logo ? (
          <View className="flex flex-row justify-between w-[400px] items-end h-12">
            <Text className="[font-family:'ClimateCrisis'] text-4xl text-fontColorSecondary">
              Results
            </Text>
            <View className="flex flex-row items-center pr-4">
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                className=" pr-4 rounded-lg flex-row items-center"
              >
                <Text className="text-backgroundSecondary [font-family:'Inter'] underline text-xl pr-2">
                  Discard
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                className="bg-fontColorPrimary rounded-lg px-6 py-2 flex justify-center items-center"
              >
                <Text className=" [font-family:'Inter'] text-white text-xl">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="h-12 flex flex-row items-end">
            <Text className=" [font-family:'ClimateCrisis'] text-4xl text-fontColorSecondary">
              Upload Image
            </Text>
          </View>
        )}
      </View>
      <View className="flex flex-col items-center justify-between bg-fontColorSecondary p-4 mt-4 rounded-lg h-[650px] w-[400px]">
        {selectedImage ? (
          <View>
            <Image
              source={{ uri: selectedImage }}
              className="w-[350px] h-[270px] rounded-lg mt-4"
            />
            <View className="flex flex-row items-center justify-between w-[350px] mt-4">
              <Text className={` font-semibold [font-family:'Inter'] text-white text-3xl ${isAI ? "text-white": "text-backupColor2"}`}>{isAI ? "Most likely AI" : "It's real!"}</Text>
              <TouchableOpacity className={` p-3 rounded-lg flex-row justify-center items-center ${isAI ?  "bg-backupColor2": "bg-fontColorPrimary"}`}>
                <Feather name="upload" size={18} color="white" />
              </TouchableOpacity>
              
            </View>
            <View className="flex flex-row items-start w-[325px]">
                <Text className=" text-3xl font-semibold text-backgroundPrimary [font-family:'Inter'] mt-3">{isAI ? aiPercent : (100 - aiPercent) }% no funny business</Text>
            </View>
            <View>
                <Text className=" text-xl  text-backgroundPrimary [font-family:'Inter'] mt-3">based on the highlighted areas</Text>
            </View>
            <View className="flex flex-row items-center mt-4">
                <Dount AI={aiPercent} notAI={100-aiPercent} />
            </View>
          </View>
        ) : (
          <>
            <Image
              source={logo}
              className="rounded-lg h-[325px] w-[350px] mt-4"
            />
            <View className="flex flex-col items-center justify-center h-[50%]">
              <TouchableOpacity
                onPress={takeImage}
                className=" bg-fontColorPrimary p-4 rounded-lg flex-row mt-6 mb items-center"
              >
                <Text className=" text-white text-3xl pr-2 ">Take Photo</Text>
                <Feather name="camera" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={pickImage}
                className=" bg-fontColorPrimary p-4 rounded-lg flex-row mt-6 mb items-center"
              >
                <Text className=" text-white text-3xl pr-2 ">
                  Upload from Library
                </Text>
                <Feather name="upload" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
