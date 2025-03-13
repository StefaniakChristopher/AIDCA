import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HOST from "@/constants/Host"; // will need to replace logic below w thbis, currently not in use

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      symbolOrNumber: /[0-9!@#$%^&*]/.test(password),
      noSpaces: !/\s/.test(password),
    };
  };
  
  const router = useRouter();
  const passwordValidation = validatePassword(password);
  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const isFormValid = firstName && lastName && email && isPasswordValid && agree;

  // Change/remove later when we get in server.js again
const getApiUrl = () => {
  if (Constants.expoConfig?.hostUri) {
    const localIp = Constants.expoConfig.hostUri.split(":").shift();
    return `http://${localIp}:3001`;
  }
  return "";
};

const HOST = getApiUrl();

// Signup function
const handleSignUp = async () => {
  if (!isFormValid) return;

  try {
    const response = await fetch(`${HOST}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName, lastName, email, password }),
    });

    const result = await response.json();

    if (result.success) {
      // Automatically call the login function with the same credentials just used to create said acc
      await handleLogin(email, password);
    } else {
      alert(result.error || "Signup failed.");
    }
  } catch (error) {
    console.error("Signup error:", error);
    alert("Signup failed: " + (error instanceof Error ? error.message : "Unknown error"));
  }
};

// Login logicc
const handleLogin = async (emailParam?: string, passwordParam?: string) => {
  const emailToUse = emailParam || email;
  const passwordToUse = passwordParam || password;

  if (!emailToUse || !passwordToUse) return;

  try {
    const response = await fetch(`${HOST}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailToUse, password: passwordToUse }),
    });

    const result = await response.json();
    if (result.success) {
      alert("Login successful!");

      // Store token in AsyncStorage for use
      await AsyncStorage.setItem("token", result.token);

      // Redirect to the home page
      router.push("/home");
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
        <Text className="text-center text-4xl font-bold text-fontColorSecondary mb-4">Sign up</Text>

        {/* First Name */}
        <Text className="text-left text-2xl font-bold text-fontColorSecondary mb-4">First Name</Text>
        <TextInput
          className="bg-white p-4 rounded-md mb-4"
          value={firstName}
          onChangeText={setFirstName}
        />

        {/* Last Name */}
        <Text className="text-left text-2xl font-bold text-fontColorSecondary mb-4">Last Name</Text>
        <TextInput
          className="bg-white p-4 rounded-md mb-4"
          value={lastName}
          onChangeText={setLastName}
        />

        <Text className="text-fontColorSecondary mb-4">Make sure it matches the name on your government ID.</Text>

        {/* Email */}
        <Text className="text-left text-2xl font-bold text-fontColorSecondary mb-4">Email</Text>
        <TextInput
          className="bg-white p-4 rounded-md mb-4"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <Text className="text-left text-2xl font-bold text-fontColorSecondary mb-4">Password</Text>
        <View className="bg-white p-4 rounded-md flex-row items-center mb-2">
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

        {/* Password Strength Validation */}
        <Text className="text-white">Password strength: {isPasswordValid ? "Good" : "Weak"}</Text>
        <Text className={passwordValidation.length ? "text-fontColorSecondary" : "text-red-500"}>✓ Must be at least 8 characters</Text>
        <Text className={passwordValidation.symbolOrNumber ? "text-fontColorSecondary" : "text-red-500"}>✓ Must have at least one symbol or number</Text>
        <Text className={passwordValidation.noSpaces ? "text-fontColorSecondary" : "text-red-500"}>✓ Cannot contain spaces</Text>

        {/* Agreement */}
        <TouchableOpacity 
          onPress={() => setAgree(!agree)} 
          className="flex-row items-center mt-4"
        >
          {/* Checkbox */}
          <View className={`w-6 h-6 border-2 rounded-md ${agree ? "bg-blue-400 border-blue-400" : "border-white"} flex items-center justify-center`}>
            {agree && <Ionicons name="checkmark" size={18} color="white" />}
          </View>

          {/* Agreement Text */}
          <Text className="text-white ml-3">
            By selecting Agree and continue, I agree to Terms of Service and Privacy Policy.
          </Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          className={`mt-6 p-4 rounded-md ${isFormValid ? "bg-fontColorSecondary" : "bg-gray-400"}`}
          disabled={!isFormValid}
          onPress={handleSignUp} // Connects button to signup function
        >
          <Text className="text-white text-center">Agree and continue</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}