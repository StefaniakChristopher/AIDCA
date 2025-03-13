import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
 
// This is the new "landing" page

const LandingPage = () => {
  const router = useRouter();

  return (
    <View className="flex-1 justify-center items-center" style={{ backgroundColor: "#00FF99", paddingHorizontal: 20 }}>
      
      {/* App Name & Tagline */}
      <View style={{ position: "absolute", top: "15%", alignItems: "center" }}>
        <Text style={{ fontSize: 60, fontFamily: "ClimateCrisis", color: "#00274D" }}>
          AIDA
        </Text>
        <Text style={{ fontSize: 18, fontFamily: "InterVariable", color: "#00274D" }}>
          Your AI Identification App
        </Text>
      </View>

      {/* Logo */}
        <Image 
          source={require("@/assets/images/logo.png")} 
          style={{ 
            width: 170,  
            height: 170,
            resizeMode: "contain",
            position: "absolute",
            top: "50%",
            transform: [{ translateY: -70 }]
          }} 
        />

        {/* Make an Account Button */}
        <TouchableOpacity 
          style={{
            backgroundColor: "#7A5AF8",
            paddingVertical: 12, 
            paddingHorizontal: 24,
            borderRadius: 10,
            width: "75%",
            alignItems: "center",
            position: "absolute",
            bottom: "15%",
          }}
          onPress={() => router.push("/signup")}
        >
          <Text style={{ fontSize: 18, fontFamily: "InterVariable", color: "white" }}>
            Make an Account
          </Text>
        </TouchableOpacity>

      {/* Already have an account text  */}
      <View style={{ 
        position: "absolute",
        bottom: "8%",
        alignItems: "center",
      }}>
        <Text style={{ fontSize: 16, fontFamily: "InterVariable", color: "#00274D" }}>
          Already have an account?
        </Text>
        
        {/* Log In Button*/}
        <Text 
          style={{ 
            fontSize: 20, 
            fontFamily: "InterVariable", 
            color: "#7A5AF8", 
            textDecorationLine: "underline",
            marginTop: 5,
          }} 
          onPress={() => router.push("/login")}
        >
          Log In
        </Text>
      </View>
    </View>
  );
};

export default LandingPage;
