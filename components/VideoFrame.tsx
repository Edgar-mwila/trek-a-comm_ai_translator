import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Video } from 'expo-av';

interface VideoFrameProps {
  videoSource: any; // Change the type based on your video source type
}

const VideoFrame: React.FC<VideoFrameProps> = ({ videoSource }) => {
  return (
    <View style={styles.container}>
      <Video
        source={videoSource}
        resizeMode='cover'
        style={styles.video}
        useNativeControls
        shouldPlay
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'black', // Background color for the video frame
  },
  video: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height/2,
  },
});

export default VideoFrame;
