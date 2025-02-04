import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// replace with actual username call
const username = 'User';

const images = [
  { id: 1, uri: require('@/assets/images/A.jpg'), label: 'AI' },
  { id: 2, uri: require('@/assets/images/B.png'), label: 'Not AI' },
  { id: 3, uri: require('@/assets/images/C.jpg'), label: 'AI' },
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
  return (
    <SafeAreaView className='flex-1 bg-backgroundPrimary'>
      {/* Header */}
      <View className=" flex flex-row justify-between items-center px-6 pt-6">
        <Text className="text-4xl [font-family:'ClimateCrisis'] text-fontColorPrimary">AIDA</Text>
        <View className=" flex items-end">
          <Text className=" text-backgroundSecondary text-xl [font-family:'Inter'] font-light ">Welcome, {username}!</Text>
          <Text className="text-white text-2xl [font-family:'Inter'] font-bold ">Gallery</Text>
        </View>
      </View>
      <View className=' h-[0.25px] bg-black my-4'></View>

      {/* Grid */}
      <View className=' flex flex-row justify-between mt-8 mx-1'>
        <View className=' flex flex-col' >
          {thinCards.map((image: any) => (
            <ThinCard key={image.id} label={image.label} isChecked={true} imageUrl={image.uri} />
          ))}
        </View>
        <View className=' flex flex-col' >
          {thickCards.map((image: any) => (
            <ThickCard key={image.id} label={image.label} isChecked={false} imageUrl={image.uri} />
          ))}
        </View>
      </View>

      
    </SafeAreaView>
  );
};

// @ts-ignore
const ThinCard = ({ label, isChecked, imageUrl }) => {
  const [height, setHeight] = useState(0);

  
    // useEffect(() => {
    //   Image.getSize(imageUrl, (width, height) => {
    //     setHeight(height);
    //   });
    // }, [imageUrl]);
  

  return (
    <ImageBackground source={imageUrl} style={{ height: getRandomHeight(100, 200)}} className=' bg-backgroundSecondary rounded-lg m-4 w-40 flex justify-end items-end' >
      <Text>
        {isChecked ? '✔ ' : '✖ '}
        {label}
      </Text>
    </ImageBackground>
  );
};

// @ts-ignore
const ThickCard = ({ label, isChecked, imageUrl }) => {
  const [height, setHeight] = useState(0);


  // useEffect(() => {
  //   Image.getSize(imageUrl, (width, height) => {
  //     setHeight(height);
  //   });
  // }, [imageUrl]);

  return (
    <ImageBackground source={imageUrl} style={{ height: getRandomHeight(100, 200) }} className=' bg-backgroundSecondary rounded-lg m-4 w-56 flex justify-end items-end'>
      <Text >
        {isChecked ? '✔ ' : '✖ '}
        {label}
      </Text>
    </ImageBackground>
  );

}



export default App;
