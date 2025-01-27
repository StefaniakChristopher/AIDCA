import React from "react";
import { View, Text } from "react-native";
import { Svg, Circle, G } from "react-native-svg";
import Octicons from '@expo/vector-icons/Octicons';

// @ts-ignore
const DonutChart = ({ AI, notAI }) => {
  const radius = 70;
  const strokeWidth = 20;
  const circumference = 2 * Math.PI * radius;

  const data = [
    { percentage: AI, color: "#7E49FF" }, // AI
    { percentage: notAI, color: "#ffffff" }, // not AI
  ];

  let startAngle = -90;

  const strokeDashoffset =
    circumference - (circumference * data[0].percentage) / 100;
  startAngle += (360 * data[0].percentage) / 100;

  // need to refactor with nativewind
  return (
    <View className="flex flex-row ">
      <Svg height="200" width="200">
        <G rotation={startAngle} origin="100, 100">
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={data[1].color}
            fill="transparent"
            strokeWidth={strokeWidth}
          />
          <Circle
            cx="100"
            cy="100"
            r={radius}
            stroke={data[0].color}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </G>
      </Svg>
      <Svg height="1" width="35" />
      <View className="flex flex-col justify-center">
        <View className="flex flex-row items-center">
            <Octicons name="dot-fill" size={15} color="white" />
            <Svg height="1" width="5" />
            <Text>Not AI</Text>
        </View>
        <View className='flex flex-row items-center'>
            <Octicons name="dot-fill" size={15} color="#7E49FF" />
            <Svg height="1" width="5" />
            <Text>AI</Text>
        </View>
      </View>
    </View>
  );
};

export default DonutChart;
