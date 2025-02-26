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
import HOST from "@/constants/Host";
import axios from "axios";

// replace with actual username call
const username = "User";

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
    console.log("dogso")
    const response = await axios.get(`${HOST}/images`);
    console.log("Image data:", response.data);
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

  useEffect(() => {
    const loadImages = async () => {
      try {
        const data = await fetchImageData();
        // Assuming your API returns an object like { images: [...] }
        setImages(data.images); 
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
                  key={image.image_id}
                  label={image.confidence_score}
                  isChecked={true}
                  imageUrl={image.file_path}
                />
              ))}
            </View>
            <View className=" flex flex-col">
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
      </View>
    </SafeAreaView>
  );
};

// @ts-ignore
const ThinCard = ({ label, isChecked, imageUrl }) => {
  const [imageHeight, setImageHeight] = useState(200)

  useEffect(() => {
    getImageHeight(imageUrl, 150).then((height) => {
      console.log("Calculated height:", height);
      setImageHeight(height);
    });
  }, [imageUrl]);

  console.log("Image URL:", getImageHeight(imageUrl, 150));
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
  const [imageHeight, setImageHeight] = useState(200)

  useEffect(() => {
    getImageHeight(imageUrl, 150).then((height) => {
      console.log("Calculated height:", height);
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
