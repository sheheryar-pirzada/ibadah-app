import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ARQiblaViewProps } from './ARQiblaView.types';

export function ARQiblaView({ style, ...props }: ARQiblaViewProps) {
  return (
    <View style={[styles.container, style]} {...props}>
      <Text style={styles.text}>AR Qibla is not available on web</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
});
