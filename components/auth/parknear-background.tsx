import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Image as RNImage, Platform, StyleSheet, useWindowDimensions, View } from 'react-native';

import { ParkNearGradients } from '@/constants/parknear-theme';

const INICIO_BG = require('@/assets/images/branding/inicio_bg.png');

const WEB_FOOTER_HEIGHT = (w: number) => Math.min(Math.max(w * 0.24, 100), 260);

type Props = {
  children: React.ReactNode;
};

export function authBackgroundFooterHeight(screenWidth: number) {
  if (Platform.OS === 'web') {
    return WEB_FOOTER_HEIGHT(screenWidth);
  }

  const resolve = RNImage.resolveAssetSource;
  if (typeof resolve === 'function') {
    const src = resolve(INICIO_BG);
    if (src?.width && src?.height) {
      return (screenWidth / src.width) * src.height;
    }
  }
  return WEB_FOOTER_HEIGHT(screenWidth);
}

export function ParkNearBackground({ children }: Props) {
  const { width } = useWindowDimensions();
  const footerHeight = authBackgroundFooterHeight(width);

  return (
    <View className="flex-1 bg-pn-sky-fade">
      <LinearGradient
        colors={[...ParkNearGradients.background]}
        locations={[0, 0.35, 0.65, 1]}
        style={[StyleSheet.absoluteFill, { zIndex: 0 }]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: footerHeight,
          zIndex: 1,
        }}>
        <Image
          source={INICIO_BG}
          style={{ width: '100%', height: '100%', opacity: 0.5 }}
          contentFit="fill"
          accessibilityRole="image"
          accessibilityLabel="Silueta de ciudad"
        />
      </View>

      <View className="flex-1" style={{ zIndex: 2 }}>
        {children}
      </View>
    </View>
  );
}
