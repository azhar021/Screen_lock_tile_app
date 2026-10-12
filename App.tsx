import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Alert,
  AppState,
  NativeModules,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SupportStatus = {
  isDeviceOwner: boolean;
  isAdminActive: boolean;
  canLock: boolean;
  supportsGoToSleep: boolean;
  summary: string;
};

const { LockTileModule } = NativeModules as {
  LockTileModule?: {
    lockDevice: () => Promise<string>;
    openDeviceAdminSettings: () => Promise<string>;
    getSupportStatus: () => Promise<SupportStatus>;
  };
};

const MISSING_MODULE_TITLE = 'Native Android module missing';
const MISSING_MODULE_BODY =
  'This app must be started with npx expo run:android so the native Quick Settings tile is installed.';

const ENV_UNAVAILABLE =
  Platform.OS !== 'android'
    ? 'Android only'
    : !LockTileModule
      ? 'Rebuild with npx expo run:android'
      : null;

export default function App() {
  const [support, setSupport] = useState<SupportStatus | null>(null);
  const [checkFailed, setCheckFailed] = useState(false);

  const unavailable = ENV_UNAVAILABLE ?? (checkFailed ? 'Support check failed' : null);
  const ready = !!support && (support.canLock || support.isAdminActive || support.isDeviceOwner);

  useEffect(() => {
    const loadStatus = async () => {
      if (ENV_UNAVAILABLE || !LockTileModule) {
        return;
      }

      try {
        const result = await LockTileModule.getSupportStatus();
        setSupport(result);
        setCheckFailed(false);
      } catch {
        setCheckFailed(true);
      }
    };

    loadStatus();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        loadStatus();
      }
    });
    return () => sub.remove();
  }, []);

  const handleEnableAdmin = async () => {
    if (Platform.OS !== 'android' || !LockTileModule) {
      Alert.alert(MISSING_MODULE_TITLE, MISSING_MODULE_BODY);
      return;
    }

    try {
      await LockTileModule.openDeviceAdminSettings();
    } catch (error: any) {
      Alert.alert('Admin settings failed', error?.message ?? 'Unable to open Android admin settings.');
    }
  };

  const handleLock = async () => {
    if (Platform.OS !== 'android' || !LockTileModule) {
      Alert.alert(MISSING_MODULE_TITLE, MISSING_MODULE_BODY);
      return;
    }
    if (!ready) {
      handleEnableAdmin();
      return;
    }

    try {
      await LockTileModule.lockDevice();
    } catch (error: any) {
      Alert.alert('Lock failed', error?.message ?? 'Enable device-admin access, then try again.');
    }
  };

  const statusText = unavailable ?? (support ? (ready ? 'Ready to lock' : 'Device admin required') : 'Checking…');

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <Text style={styles.brand}>Screen Lock</Text>
      <View style={[styles.chip, ready ? styles.chipReady : styles.chipWarn]}>
        <View style={[styles.dot, { backgroundColor: ready ? '#4ade80' : '#fbbf24' }]} />
        <Text style={styles.chipText}>{statusText}</Text>
      </View>

      <Pressable
        onPress={handleLock}
        accessibilityRole="button"
        accessibilityLabel={ready ? 'Lock screen now' : 'Enable device admin'}
        style={({ pressed }) => [
          styles.lockButton,
          !ready && styles.lockButtonIdle,
          pressed && styles.lockButtonPressed,
        ]}
      >
        <MaterialIcons name={ready ? 'lock' : 'lock-open'} size={72} color={ready ? '#1c1917' : '#d6d3d1'} />
      </Pressable>

      <Text style={styles.hint}>{ready ? 'Tap to lock now' : 'Tap to enable device admin'}</Text>

      <View style={styles.steps}>
        <Step done={ready} index={1} text="Allow device admin access" onPress={ready ? undefined : handleEnableAdmin} />
        <Step index={2} text="Open Quick Settings and tap the edit pencil" />
        <Step index={3} text="Add the “Screen Lock” tile" />
      </View>
    </View>
  );
}

function Step({
  index,
  text,
  done,
  onPress,
}: {
  index: number;
  text: string;
  done?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.step, pressed && styles.stepPressed]}
    >
      <View style={[styles.stepBadge, done && styles.stepBadgeDone]}>
        {done ? (
          <MaterialIcons name="check" size={14} color="#1c1917" />
        ) : (
          <Text style={styles.stepIndex}>{index}</Text>
        )}
      </View>
      <Text style={[styles.stepText, done && styles.stepTextDone]}>{text}</Text>
      {onPress ? <MaterialIcons name="chevron-right" size={20} color="#78716c" /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0a09',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  orbTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: '#1c1917',
  },
  orbBottom: {
    position: 'absolute',
    bottom: -140,
    left: -100,
    width: 360,
    height: 360,
    borderRadius: 180,
    backgroundColor: '#292524',
    opacity: 0.55,
  },
  brand: {
    color: '#a8a29e',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 40,
  },
  chipReady: {
    backgroundColor: 'rgba(74, 222, 128, 0.08)',
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  chipWarn: {
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderColor: 'rgba(251, 191, 36, 0.25)',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  chipText: {
    color: '#e7e5e4',
    fontSize: 13,
    fontWeight: '600',
  },
  lockButton: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#fafaf9',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
  lockButtonIdle: {
    backgroundColor: 'rgba(68, 64, 60, 0.55)',
    elevation: 0,
  },
  lockButtonPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  hint: {
    color: '#78716c',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 22,
    marginBottom: 44,
  },
  steps: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: 'rgba(41, 37, 36, 0.6)',
    borderRadius: 24,
    paddingVertical: 6,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
  },
  stepPressed: {
    backgroundColor: 'rgba(68, 64, 60, 0.5)',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(120, 113, 108, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeDone: {
    backgroundColor: '#4ade80',
  },
  stepIndex: {
    color: '#e7e5e4',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    color: '#e7e5e4',
    fontSize: 14,
    fontWeight: '500',
  },
  stepTextDone: {
    color: '#78716c',
    textDecorationLine: 'line-through',
  },
});
