import React from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity } from 'react-native';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [calculation] = React.useState('Standard');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Prayer Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: '#767577', true: '#1a5f3f' }}
          thumbColor={notifications ? '#d4af37' : '#f4f3f4'}
        />
      </View>

      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>Dark Mode</Text>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#767577', true: '#1a5f3f' }}
          thumbColor={darkMode ? '#d4af37' : '#f4f3f4'}
        />
      </View>

      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingLabel}>Calculation Method</Text>
        <Text style={styles.settingValue}>{calculation}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingRow}>
        <Text style={styles.settingLabel}>About</Text>
        <Text style={styles.settingValue}>v1.0.0</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#0f3d2c' },
  title:         { color: '#d4af37', fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 30 },
  settingRow:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#2d7a57' },
  settingLabel:  { color: '#fff', fontSize: 18 },
  settingValue:  { color: '#d4af37', fontSize: 16 },
});
