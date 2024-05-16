import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Bookmark {
  input: string;
  output: string;
}

const BookmarksTab = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        const storedBookmarks = await AsyncStorage.getItem('bookmarks');
        if (storedBookmarks) {
          setBookmarks(JSON.parse(storedBookmarks));
        }
      } catch (error) {
        console.error('Error fetching bookmarks:', error);
      }
    };

    fetchBookmarks();
  }, []); // Adding an empty dependency array ensures this runs once on mount

  const clearBookmarks = async () => {
    try {
      await AsyncStorage.removeItem('bookmarks');
      setBookmarks([]);
      alert('Bookmarks cleared successfully!');
    } catch (error) {
      console.error('Error clearing bookmarks:', error);
      alert('Failed to clear bookmarks!');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={bookmarks}
        renderItem={({ item, index }) => (
          <View key={index} style={styles.bookmarkContainer}>
            <Text style={styles.bookmarkText}>Original: {item.input}</Text>
            <Text style={styles.bookmarkText}>Translation: {item.output}</Text>
          </View>
        )}
        keyExtractor={(index) => index.toString()}
      />
      <Button title="Clear Bookmarks" onPress={clearBookmarks} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  bookmarkContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  bookmarkText: {
    fontSize: 16,
  },
});

export default BookmarksTab;
