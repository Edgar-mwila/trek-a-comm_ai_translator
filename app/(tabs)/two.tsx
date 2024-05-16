import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface HistoryItem {
  input: string;
  output: string;
}

const HistoryTab = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('history');
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      }
    };

    fetchHistory();
  }, []);

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem('history');
      setHistory([]);
      alert('History cleared successfully!');
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Failed to clear history!');
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={history}
        renderItem={({ item, index }) => (
          <View key={index} style={styles.historyItemContainer}>
            <Text style={styles.historyText}>Original: {item.input}</Text>
            <Text style={styles.historyText}>Translation: {item.output}</Text>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
      <Button title="Clear History" onPress={clearHistory} />
    </View>
  );
};

export default HistoryTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  historyItemContainer: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  historyText: {
    fontSize: 16,
  },
});
