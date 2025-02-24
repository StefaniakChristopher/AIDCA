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
import Feather from '@expo/vector-icons/Feather';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { TAB_BAR_HEIGHT } from "./_layout";
import { useRouter } from "expo-router";

// replace with actual username call
const username = "User";

// example images
const images = [
  { id: 1, uri: require("@/assets/images/A.jpg"), label: "95" },
  { id: 2, uri: require("@/assets/images/B.png"), label: "10" },
  { id: 3, uri: require("@/assets/images/C.jpg"), label: "10" },
  { id: 4, uri: require("@/assets/images/D.png"), label: "10" },
  { id: 5, uri: require("@/assets/images/E.jpg"), label: "10" },
  { id: 6, uri: require("@/assets/images/F.jpg"), label: "10" },
  // Add more images as needed
];

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

const getRandomHeight = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const App = () => {
  const router = useRouter();
  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-backgroundPrimary">
      {/* Header */}
      <View className=" flex flex-row justify-between items-center px-6 pt-6">
        <Text className="text-4xl [font-family:'ClimateCrisis'] text-fontColorPrimary">
          AIDA
        </Text>
        {/* Changed for now to work on Sign Up page, will change back to read the user that is currently logged in*/}
        <View className="flex items-end">
          {/* Sign Up Button */}
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text className="text-backgroundSecondary text-xl [font-family:'Inter'] font-light">Sign Up</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl [font-family:'Inter'] font-bold ">
            Gallery
          </Text>
        </View>
      </View>
      <View className=" h-[0.25px] bg-backgroundPrimary my-2"></View>

      {/* Masonry */}
      <View className="flex-1">
        <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}>
          <View className=" flex flex-row justify-between mx-4">
            <View className=" flex flex-col">
              {thinCards.map((image: any) => (
                <ThinCard
                  key={image.id}
                  label={image.label}
                  isChecked={true}
                  imageUrl={image.uri}
                />
              ))}
            </View>
            <View className=" flex flex-col">
              {thickCards.map((image: any) => (
                <ThickCard
                  key={image.id}
                  label={image.label}
                  imageUrl={image.uri}
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

// @ts-ignore
const ThinCard = ({ label, isChecked, imageUrl }) => {

  // useEffect(() => {
  //   Image.getSize(imageUrl, (width, height) => {
  //     setHeight(height);
  //   });
  // }, [imageUrl]);

  return (
    <ImageBackground
      source={imageUrl}
      style={{ height: getRandomHeight(150, 250) }}
      imageStyle={{ borderRadius: 10 }}
      className=" rounded-lg m-1.5 w-40 flex justify-end items-end"
    >
      <View
        className={`${label > 50
            ? "bg-fontColorPrimary text-white"
            : " bg-fontColorSecondary text-backgroundPrimary"
          } py-1 px-2 rounded-md flex flex-row justify-between items-center`}
      >
        {label > 50 ? <Ionicons name="checkmark-sharp" size={14} color="white" /> : <FontAwesome6 name="xmark" size={14} />}
        <Text className={`ml-2 ${label > 50 ? "text-white" : "text-backgroundPrimary"}`}>
          {label}% AI
        </Text>
      </View>
    </ImageBackground>
  );
};

// @ts-ignore
const ThickCard = ({ label, imageUrl }) => {
  return (
    <View>
      <ImageBackground
        source={imageUrl}
        style={{ height: getRandomHeight(150, 250) }}
        imageStyle={{ borderRadius: 10 }}
        className="rounded-lg m-4 w-56 flex justify-end items-end"
      >
        <View
          className={`${label > 50
              ? "bg-fontColorPrimary text-white"
              : " bg-fontColorSecondary text-backgroundPrimary"
            } py-1 px-2 rounded-md flex flex-row justify-between items-center`}
        >
          {label > 50 ? <Ionicons name="checkmark-sharp" size={14} color="white" /> : <FontAwesome6 name="xmark" size={14} />}
          <Text className={`ml-2 ${label > 50 ? "text-white" : "text-backgroundPrimary"}`}>
            {label}%
            AI
          </Text>

        </View>
      </ImageBackground>
    </View>
  );
};

export default App;
