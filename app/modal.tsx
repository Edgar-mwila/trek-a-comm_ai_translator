import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import VideoFrame from '@/components/VideoFrame';
import { Text, View } from '@/components/Themed';

export default function ModalScreen() {
  const video = require('@/assets/images/Trek-A-Comm Translator.mp4')
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About Weiser Agencies</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text>More information about Weiser Agencies.</Text>
      <VideoFrame videoSource={video}/>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
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
