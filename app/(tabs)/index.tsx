import React, { useState, useEffect } from 'react';
import { View, Button, Text, TextInput, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons'
import { Audio } from 'expo-av';
import { Picker } from '@react-native-picker/picker';
import * as Speech from 'expo-speech'
import * as Localization  from 'expo-localization';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const SpeechInputScreen: React.FC = () => {
  const [selectedInputLanguage, setSelectedInputLanguage] = useState();
  const [selectedOutputLanguage, setSelectedOutputLanguage] = useState();
  const [translatedText, setTranslatedText] = useState('');
  const [text, setText] = useState('');
  const languages = Localization.getLocales();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();

  const handleSpeechToText = async (recording: Audio.Recording | null) => {
    try {
      const { status, data } = await axios.post('http://192.168.43.70:5000/speech-to-text', {
        audio_content: recording,
      });
      if (status === 200) {
        const text = data.text;
        setText(text);
      } else {
      console.error('Failed to transcribe speech');
      } 
    } catch (error) {
        console.error('Error fetching transcription:', error);
      }
  };  

  const saveHistory = async () => {
    try {
      if (text.trim() !== '') {
        const existingHistory = await AsyncStorage.getItem('history');
        const updatedHistory = existingHistory ? JSON.parse(existingHistory) : [];
        updatedHistory.push(text);
        await AsyncStorage.setItem('history', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  };

  const saveBookmark = async () => {
    try {
      if (text.trim() !== '') {
        const existingBookmarks = await AsyncStorage.getItem('bookmarks');
        const updatedBookmarks = existingBookmarks ? JSON.parse(existingBookmarks) : [];
        updatedBookmarks.push(text);
        await AsyncStorage.setItem('bookmarks', JSON.stringify(updatedBookmarks));
        alert('Bookmark saved successfully!');
      } else {
        alert('Please enter a valid bookmark text!');
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
      const { recording } = await Audio.Recording.createAsync( Audio.RecordingOptionsPresets.HIGH_QUALITY);
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
    await Audio.setAudioModeAsync(
      {
        allowsRecordingIOS: false,
      }
    );
    handleSpeechToText(recording);
    const uri = recording?.getURI();
    console.log('Recording stopped and stored at', uri);
  }

  const speak = (text: string) => {
    Speech.speak(text)
  }

  const handleTranslate = async () => {
    try {
      const response = await axios.post('http://192.168.43.70:5000/translate', {
          text: text,
          dest_language: selectedOutputLanguage });
      
      if (response.status === 200) {
        const translatedText = response.data.translated_text;
        setTranslatedText(translatedText);
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
        <View style={[styles.languageContainer , {backgroundColor: "lightgray"}]}>
          <Picker
            selectedValue={selectedInputLanguage}
            style={{ height: 50, width: 150 }}
            onValueChange={(itemValue) => setSelectedInputLanguage(itemValue)}
          >
            {languages.map((language, index) => (
              <Picker.Item key={index} label={language.languageTag} value={language.languageCode} />
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
      </View>
        <TouchableOpacity onPress={() => {
          saveHistory();
          handleTranslate()
        }}>
          <AntDesign name="downcircleo" size={30} color="black" />
        </TouchableOpacity>
      <View style={[styles.box, styles.topBox, {}]}>
        <View style={[styles.languageContainer, {backgroundColor: "lightgray"}]}>
          <Picker
            selectedValue={selectedOutputLanguage}
            style={{ height: 50, width: 150}}
            onValueChange={(itemValue) => setSelectedOutputLanguage(itemValue)}
          >
            {languages.map((language, index) => (
              <Picker.Item key={index} label={language.languageTag} value={language.languageCode} />
            ))}
          </Picker>
        <TouchableOpacity onPress={() => speak(translatedText)} style={styles.translateButton}>
          <AntDesign name="sound" size={24} color="black" />
        </TouchableOpacity>
        </View>
        <Text>{translatedText}</Text>
      </View>
    <View style={styles.speechButton}>
      <TouchableOpacity onPress={recording ? stopRecording : startRecording}>
        <AntDesign name="sound" color={recording ? "red" :"black"} size={30}/>
      </TouchableOpacity>
    </View>
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