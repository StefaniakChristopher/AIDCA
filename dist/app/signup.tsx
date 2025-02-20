import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function SignUpScreen() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);


// This page is not done yet, still editing this as you read this most likely


// Can edit this to fit what we want/make it less complicated maybe
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
        >
          <Text className="text-white text-center">Agree and continue</Text>
        </TouchableOpacity>
    </SafeAreaView>
  );
}