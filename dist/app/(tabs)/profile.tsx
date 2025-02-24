import React from "react";
import { View, Text, TouchableOpacity, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";


// Quixkly made this to get started on the maybe having a more in depth profile ?? idk we can delete this if we want to
// Idea would be for the user to view their account such as email, name, and be able to edit those if they wish
// and maybe images in more depth
// Samplespot for images (replace with actual image data and functions later yayaya)
const savedImages = [
  { id: 1, name: "AI Art", uri: "https://placeholder.com" },
  { id: 2, name: "Sunset", uri: "https://placeholder.com" },
  { id: 3, name: "Portrait", uri: "https://placeholder.com" },
];

type RootStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export default function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView className="flex-1 bg-backgroundPrimary">
      {/*Header*/}
      <View className="p-6 flex-row items-center justify-between">
        <Text className="text-4xl [font-family:'ClimateCrisis'] text-backupColor2">Profile</Text>

        {/*Settings button that doesnt go anyhere yet, here for fun in case we want to remove it from nav bar maybe perhaps perchance*/}
        <TouchableOpacity onPress={() => navigation.navigate("Settings")} className="p-2 bg-fontColorPrimary rounded-lg flex-row items-center">
          <Feather name="settings" size={20} color="white" />
          <Text className="ml-2 text-white">Settings</Text>
        </TouchableOpacity>
      </View>

      {/*Username section that will get the users name when logged in n all thatttt*/}
      <View className="px-6 pb-6 flex-row items-center justify-between">
        <Text className="text-xl text-white">Username: <Text className="font-bold">SuperCOOOLUSERNAMMMEE</Text></Text>
      </View>

      {/*Saved images section*/}
      <View className="px-6">
        <Text className="text-xl text-white mb-2">Saved Images</Text>
      </View>

      {/*Scrollable list*/}
      <ScrollView className="px-6">
        {savedImages.map((image) => (
          <View key={image.id} className="flex-row items-center mb-4 bg-fontColorSecondary p-3 rounded-lg">
            <Image source={{ uri: image.uri }} className="w-16 h-16 rounded-lg" />
            <Text className="ml-4 text-white text-lg">{image.name}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
