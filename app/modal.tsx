import { StyleSheet, Pressable, Image } from 'react-native';
import VideoFrame from '@/components/VideoFrame';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';

export default function ModalScreen() {
  const video = require('@/assets/images/Trek-A-Comm Translator.mp4')
  return (
    <View style={styles.container}>
      <Image source={require('@/assets/images/icon.jpg')} resizeMode='cover' style={{height: 150, width: 150}}/>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text style={styles.subtext}>MORE INFORMATION ABOUT WEISER AGENCIES GOES HERE.</Text>
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
  subtext: {
    fontSize: 15,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
