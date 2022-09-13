import * as React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { SafeAreaProvider } from 'react-native-safe-area-context';
import Player from './Player';

export default function App() {
  

  return (
    <SafeAreaProvider style={styles.container}>
      <View style={styles.topBar} />
      <Player />
      <View style={styles.bottomBar} />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#414141',
  },
  player: {
    width: '100%',
    height: 260,
    // marginVertical: 5,
  },
  topBar: {
    width: '100%',
    height: 50,
    backgroundColor: '#212121',
  },
  bottomBar: {
    width: '100%',
    height: 50,
    backgroundColor: '#212121',
  },
  buttonContainer: {
    padding: 10,
    backgroundColor: 'pink',
    zIndex: 1,
  },
});
