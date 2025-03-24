import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import Constants from "expo-constants";
import HOST from "@/constants/Host";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const router = useRouter();

  const isFormValid = email && password;

  // SPECIALLLLLLLL NOTE
  // mainly just using for functionality rn, ik its v plain
  // :)


const handleLogin = async () => {
  if (!isFormValid) return;

  await AsyncStorage.removeItem("token");
  try {
    const response = await fetch(`${HOST}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to log in.");
    }

    const result = await response.json();
    if (result.success) {
      alert("Login successful!");
      
      // Store token in AsyncStorage
      await AsyncStorage.setItem("token", result.token);
      
      // Redirect to the home page
      router.push("/(tabs)/home");
    } else {
      alert(result.error);
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Login failed: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};
 
  return (
    <SafeAreaView className="flex-1 bg-backgroundPrimary p-6">

      {/* Back Button */}
      <TouchableOpacity 
        onPress={() => router.back()} 
        className="absolute top-16 left-6 p-3 rounded-full bg-opacity-50"
      >
        <Ionicons name="arrow-back" size={28} color="white" />
      </TouchableOpacity>

      {/* Header */}
      <Text className="text-center text-4xl font-bold text-fontColorSecondary mb-6">Log in</Text>

      {/* Email Input */}
      <Text className="text-left text-2xl font-bold text-fontColorSecondary mb-2">Email</Text>
      <TextInput
        className="bg-white p-4 rounded-md mb-4"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <Text className="text-left text-2xl font-bold text-fontColorSecondary mb-2">Password</Text>
      <View className="bg-white p-4 rounded-md flex-row items-center mb-4">
        <TextInput
          className="flex-1"
          value={password}
          secureTextEntry={!passwordVisible}
          onChangeText={setPassword}
        />
        <TouchableOpacity 
          onPress={() => setPasswordVisible(!passwordVisible)}
          className="absolute right-3 top-3"
        >
          <Ionicons 
            name={passwordVisible ? "eye-off" : "eye"} 
            size={24} 
            color="black"
          />
        </TouchableOpacity>
      </View>

      {/* Forgot Password Link (doesnt do go anywhere just for looks)*/}
      <TouchableOpacity 
        onPress={() => console.log("Navigate to forgot password")}
        className="mb-6"
      >
        <Text className="text-fontColorSecondary text-lg underline text-right">
          Forgot Password?
        </Text>
      </TouchableOpacity>

      {/* Log In Button */}
      <TouchableOpacity
        className={`p-4 rounded-md ${isFormValid ? "bg-fontColorSecondary" : "bg-gray-400"}`}
        disabled={!isFormValid}
        onPress={handleLogin}
      >
        <Text className="text-white text-center text-lg">Log in</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <Text className="mt-6 text-white text-center">
        Don't have an account?{" "}
        <Text 
          className="text-fontColorSecondary underline"
          onPress={() => router.push("/signup")}
        >
          Sign up
        </Text>
      </Text>
    </SafeAreaView>
  );
}
