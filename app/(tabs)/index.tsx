import React, { useState, useEffect } from 'react';
import { Button, TextInput, TouchableOpacity, Modal, Pressable } from 'react-native';
import VideoFrame from '@/components/VideoFrame';
import { Text, View } from '@/components/Themed';
import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import * as Speech from 'expo-speech';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface languages {
  name: string,
  tag: string
}

const SpeechInputScreen: React.FC = () => {
  const [selectedInputLanguage, setSelectedInputLanguage] = useState<string | undefined>('en');
  const [selectedOutputLanguage, setSelectedOutputLanguage] = useState<string | undefined>('es');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [text, setText] = useState<string>('');
  const languages: languages[] = [{name: 'english',tag: 'en'}, {name: 'spanish',tag: 'es'}];
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [modal, setModal] = useState(true);
  const video = require('@/assets/images/Trek-A-Comm Translator.mp4')

  useEffect(() => {
    (async () => {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
    })();
  }, []);

  const handleSpeechToText = async (recording: Audio.Recording | null) => {
    if (!recording) return;
    try {
      const uri = recording.getURI();
      if (!uri) return;

      const formData = new FormData();
      formData.append('audio_file', {
        uri: uri,
        type: 'audio/wav',
        name: 'speech.wav',
      } as any);

      const response = await axios.post('http://edgarmwila.pythonanywhere.com/speech-to-text', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        const text = response.data.text;
        setText(text);
      } else {
        console.error('Failed to transcribe speech', response);
      }
    } catch (error) {
      console.error('Error fetching transcription:', error);
    }
  };

  const saveHistory = async () => {
    try {
      if (text.trim() !== '') {
        if (translatedText.trim() !== '') {
          const existingHistory = await AsyncStorage.getItem('history');
          const updatedHistory = existingHistory ? JSON.parse(existingHistory) : [];
          updatedHistory.push({ input: text, output: translatedText });
          await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));
        }
      }
    } catch (error) {
      console.error('Error saving history:', error);
    }
  };

  const saveBookmark = async () => {
    try {
      if (text.trim() !== '') {
        if (translatedText.trim() !== '') {
          const existingBookmarks = await AsyncStorage.getItem('bookmarks');
          const updatedBookmarks = existingBookmarks ? JSON.parse(existingBookmarks) : [];
          updatedBookmarks.push({ input: text, output: translatedText });
          await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
          alert('Bookmark saved successfully!');
        } else {
          alert('Please translate text first!');
        }
      } else {
        alert('Please enter a valid text!');
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
      alert('Failed to save bookmark!');
    }
  };

  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      console.log('Recording started');
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    console.log('Stopping recording..');
    setRecording(null);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording?.getURI();
    console.log('Recording stopped and stored at', uri);
    if (uri) {
      handleSpeechToText(recording);
    }
  }

  const speak = (text: string) => {
    Speech.speak(text);
  };

  const handleTranslate = async () => {
    try {
      const response = await axios.post('http://edgarmwila.pythonanywhere.com/translate', {
        text: text,
        source_language: selectedInputLanguage,
        dest_language: selectedOutputLanguage,
      });

      if (response.status === 200) {
        const translatedText = response.data.translated_text;
        setTranslatedText(translatedText);
        saveHistory();
      } else {
        console.error('Failed to translate text:', response.statusText);
      }
    } catch (error) {
      console.error('Error translating text:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.box, styles.topBox]}>
        <View style={[styles.languageContainer, { backgroundColor: "lightgray" }]}>
          <Picker
            selectedValue={selectedInputLanguage}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue) => setSelectedInputLanguage(itemValue)}
          >
            {languages.map((language, index) => (
              <Picker.Item key={index} label={language.name} value={language.tag} />
            ))}
          </Picker>
          <TouchableOpacity onPress={() => saveBookmark()} style={styles.translateButton}>
            <AntDesign name="staro" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.inputText}
          placeholder="Enter text to translate"
          onChangeText={setText}
          value={text}
        />
        <Button title='clear' onPress={() => setText('')} />
      </View>
      <TouchableOpacity onPress={() => {
        handleTranslate();
      }}>
        <AntDesign name="downcircleo" size={30} color="black" />
      </TouchableOpacity>
      <View style={[styles.box, styles.topBox]}>
        <View style={[styles.languageContainer, { backgroundColor: "lightgray" }]}>
          <Picker
            selectedValue={selectedOutputLanguage}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue) => setSelectedOutputLanguage(itemValue)}
          >
            {languages.map((language, index) => (
              <Picker.Item key={index} label={language.name} value={language.tag} />
            ))}
          </Picker>
          <TouchableOpacity onPress={() => speak(translatedText)} style={styles.translateButton}>
            <AntDesign name="sound" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text style={styles.inputText}>{translatedText}</Text>
        <Button title='clear' onPress={() => setTranslatedText('')} />
      </View>
      <View style={styles.speechButton}>
        <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
          <AntDesign name="sound" color={recording ? "red" : "black"} size={30} />
        </TouchableOpacity>
      </View>
      {
        <Modal visible={modal}>
          <View style={styles.container}>
              <TouchableOpacity onPress={() => setModal(!modal)}>
                  <Text style={styles.title}>START TRANSLATOR</Text>
              </TouchableOpacity>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <VideoFrame videoSource={video}/>
          </View>
        </Modal>
      }
    </View>

  );
};


export default SpeechInputScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: 'gray',
  },
  topBox: {
    height: '40%',
  },
  middleBox: {
    height: '40%',
  },
  bottomBox: {
    height: '20%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  translateButton: {
    position: 'absolute',
    right: 10,
    top: 10,
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
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  languageText: {
    fontSize: 16,
  },
  inputText: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
  },
  bookmarkButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
    backgroundColor: 'lightgray',
    padding: 5,
    borderRadius: 5,
  },
  bookmarkText: {
    fontWeight: 'bold',
  },
  translatedText: {
    marginTop: 10,
  },
  speechButton: {
    padding: 10,
    backgroundColor: "lightblue",
    borderRadius: 50,
  },
});

