import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// replace with actual username call
const username = 'User';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View className=" flex flex-row justify-between items-center p-6">
        <Text className="text-4xl [font-family:'ClimateCrisis'] text-fontColorPrimary">AIDA</Text>
        <View className=" flex items-end">
          <Text className=" text-backgroundSecondary text-xl [font-family:'Inter'] font-light ">Welcome, {username}!</Text>
          <Text className="text-white text-2xl [font-family:'Inter'] font-bold ">Gallery</Text>
        </View>
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        <View style={styles.cardRow}>
          <Card label="10% AI" isChecked={false} />
          <Card label="95% AI" isChecked={true} />
        </View>
        <View style={styles.cardRow}>
          <Card label="10% AI" isChecked={false} />
          <Card label="10% AI" isChecked={false} />
        </View>
      </View>

      
    </SafeAreaView>
  );
};

// @ts-ignore
const Card = ({ label, isChecked }) => (
  <View style={styles.card}>
    <Text style={[styles.label, isChecked ? styles.checked : styles.unchecked]}>
      {isChecked ? '✔ ' : '✖ '}
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#001a4d',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3399',
  },
  galleryText: {
    fontSize: 18,
    color: '#fff',
  },
  grid: {
    flex: 1,
    padding: 16,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    flex: 1,
    height: 120,
    backgroundColor: '#80bfff',
    borderRadius: 8,
    marginHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  checked: {
    color: '#ff3399',
  },
  unchecked: {
    color: '#33cc33',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ff3399',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#003366',
    paddingVertical: 10,
  },
});

export default App;
