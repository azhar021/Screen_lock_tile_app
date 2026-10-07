import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  NativeModules,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  const statusTone = status.toLowerCase().includes('failed') || status.toLowerCase().includes('not')
    ? 'warning'
    : 'success';

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
      setStatus('Admin settings opened. Next: enable the app in Device admin apps, then add the Screen Lock tile from Quick Settings.');
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
      <View style={styles.heroGlow} />

      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.iconWrap}>
            <MaterialIcons name="lock" size={76} color="#f8fafc" />
          </View>
          <View>
            <Text style={styles.title}>Screen Lock</Text>
            <Text style={styles.subtitle}>Quick Settings helper</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.statusPanel}>
          <View style={styles.statusHeader}>
            <Text style={styles.panelLabel}>System status</Text>
            <View style={[styles.badge, statusTone === 'warning' ? styles.badgeWarning : styles.badgeSuccess]}>
              <Text style={styles.badgeText}>{statusTone === 'warning' ? 'Needs attention' : 'Active'}</Text>
            </View>
          </View>
          <Text style={styles.status}>{status}</Text>
        </View>

        <View style={styles.primaryActionWrap}>
          <TouchableOpacity style={styles.primaryAction} onPress={handleEnableAdmin}>
            <Text style={styles.primaryButtonText}>Enable Device Admin</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.secondaryAction} onPress={handleLock}>
            <MaterialIcons name="screen-lock-portrait" size={22} color="#e2e8f0" />
            <Text style={styles.secondaryButtonText}>Lock Screen</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.guidePanel}>
          <Text style={styles.guideTitle}>How to set it up</Text>
          <Text style={styles.stepText}>1. Tap “Enable Device Admin” and allow access in Android settings.</Text>
          <Text style={styles.stepText}>2. Open the Quick Settings panel and press the edit pencil.</Text>
          <Text style={styles.stepText}>3. Add the “Screen Lock” tile to your enabled tiles.</Text>
          <Text style={styles.stepText}>4. Tap the tile anytime to lock the device instantly.</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050b14',
    paddingHorizontal: 0,
    paddingVertical: 0,
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: -80,
    left: -80,
    right: -80,
    height: 360,
    backgroundColor: '#111827',
    borderBottomLeftRadius: 120,
    borderBottomRightRadius: 120,
    opacity: 0.9,
  },
  topBar: {
    paddingTop: 52,
    paddingHorizontal: 22,
    zIndex: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 30,
    backgroundColor: 'linear-gradient(135deg, #7c8cff 0%, #4f46e5 100%)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    shadowColor: '#7c8cff',
    shadowOpacity: 0.4,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  title: {
    color: '#f8fafc',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    color: '#93c5fd',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 28,
    zIndex: 1,
  },
  statusPanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.18)',
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  panelLabel: {
    color: '#bfdbfe',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  badgeText: {
    color: '#f8fafc',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  status: {
    color: '#f8fafc',
    fontSize: 14,
    lineHeight: 22,
  },
  primaryActionWrap: {
    marginBottom: 14,
  },
  primaryAction: {
    width: '100%',
    borderRadius: 18,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7c8cff',
    shadowColor: '#7c8cff',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  primaryButtonText: {
    color: '#f8fafc',
    fontWeight: '800',
    fontSize: 17,
    letterSpacing: 0.2,
  },
  actionRow: {
    marginBottom: 20,
  },
  secondaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    borderRadius: 18,
    paddingVertical: 16,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
  },
  secondaryButtonText: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 16,
  },
  guidePanel: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderColor: 'rgba(148, 163, 184, 0.18)',
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    marginTop: 8,
  },
  guideTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  stepText: {
    color: '#dbeafe',
    fontSize: 13.5,
    lineHeight: 22,
    marginBottom: 6,
  },
});
