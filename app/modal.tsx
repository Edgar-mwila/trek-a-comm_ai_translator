import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Pressable } from 'react-native';
import VideoFrame from '@/components/VideoFrame';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';

export default function ModalScreen() {
  const video = require('@/assets/images/Trek-A-Comm Translator.mp4')
  return (
    <View style={styles.container}>
      <Link href="/(tabs)" asChild style={{borderWidth: 1, marginTop: 5}}>
        <Pressable>
          {({ pressed }) => (
            <Text style={styles.title}>START TRANSLATOR</Text>
          )}
        </Pressable>
      </Link>
      
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <VideoFrame videoSource={video}/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
