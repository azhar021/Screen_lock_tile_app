import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { LockTileModule } = NativeModules as {
  LockTileModule?: {
    lockDevice: () => Promise<string>;
    openDeviceAdminSettings: () => Promise<string>;
    getSupportStatus: () => Promise<{
      isDeviceOwner: boolean;
      isAdminActive: boolean;
      canLock: boolean;
      supportsGoToSleep: boolean;
      summary: string;
    }>;
  };
};

export default function App() {
  const [status, setStatus] = useState('Checking support...');

  useEffect(() => {
    const loadStatus = async () => {
      if (!LockTileModule) {
        setStatus(
          'Native Android module is not loaded. Run npx expo run:android once to rebuild the app with the Quick Settings tile.',
        );
        return;
      }

      try {
        const result = await LockTileModule.getSupportStatus();
        setStatus(result?.summary ?? 'Native module available.');
      } catch (error) {
        setStatus('Support check failed.');
      }
    };

    if (Platform.OS === 'android') {
      loadStatus();
    } else {
      setStatus('This demo is Android-only.');
    }
  }, []);

  const handleEnableAdmin = async () => {
    if (Platform.OS !== 'android' || !LockTileModule) {
      Alert.alert(
        'Native Android module missing',
        'This app must be started with npx expo run:android so the native Quick Settings tile is installed.',
      );
      return;
    }

    try {
      const result = await LockTileModule.openDeviceAdminSettings();
      setStatus(result);
    } catch (error: any) {
      Alert.alert('Admin settings failed', error?.message ?? 'Unable to open Android admin settings.');
      setStatus('Unable to open Android admin settings.');
    }
  };

  const handleLock = async () => {
    if (Platform.OS !== 'android' || !LockTileModule) {
      Alert.alert(
        'Native Android module missing',
        'This app must be started with npx expo run:android so the native Quick Settings tile is installed.',
      );
      return;
    }

    try {
      const result = await LockTileModule.lockDevice();
      setStatus(result);
    } catch (error: any) {
      Alert.alert(
        'Lock failed',
        error?.message ?? 'Enable device-admin access, then try the lock again.',
      );
      setStatus('Lock request was rejected by Android. Enable device-admin access and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lock Tile Demo</Text>
      <Text style={styles.subtitle}>Adds a custom Android Quick Settings tile.</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Status</Text>
        <Text style={styles.status}>{status}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Button title="Enable Device Admin" onPress={handleEnableAdmin} />
      </View>
      <View style={styles.buttonRow}>
        <Button title="Lock Screen" onPress={handleLock} />
      </View>

      <Text style={styles.note}>
        Android requires device-admin or device-owner access before a regular app can lock the screen
        like the power button. This sample shows the device-admin activation flow and the native tile
        integration.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1020',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    fontSize: 16,
    marginBottom: 24,
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#111827',
    marginBottom: 24,
  },
  cardTitle: {
    color: '#60a5fa',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  status: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 20,
  },
  buttonRow: {
    width: '100%',
    marginBottom: 12,
  },
  note: {
    marginTop: 20,
    color: '#cbd5e1',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
  },
});
