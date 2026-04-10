import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ParkNearBackground } from '@/components/auth/parknear-background';

const LOGO = require('@/assets/images/branding/Parknear_logo-removebg-preview.png');

function useLogoSize() {
  const { width: w, height: h } = useWindowDimensions();
  const logoWidth = w * 0.94;
  const rawHeight = logoWidth * 0.58;
  const logoHeight = Math.min(Math.max(rawHeight, 160), h * 0.45);
  return { logoWidth, logoHeight };
}

export default function WelcomeScreen() {
  const { logoWidth, logoHeight } = useLogoSize();

  return (
    <ParkNearBackground>
      <SafeAreaView className="flex-1" edges={['top', 'left', 'right']}>
        <View className="-mt-10 flex-1 items-center justify-center px-3">
          <Image
            source={LOGO}
            accessibilityLabel="ParkNear"
            accessibilityRole="image"
            contentFit="contain"
            style={{ width: logoWidth, height: logoHeight, marginBottom: 12 }}
          />
          <Pressable
            className="mt-2 min-w-[220px] items-center rounded-full bg-pn-white px-12 py-4 shadow-md shadow-pn-navy/20 elevation-4 active:opacity-90 active:scale-[0.98]"
            onPress={() => router.push('/login')}>
            <Text className="text-lg font-bold text-pn-navy">Accede</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/register')} className="mt-5 py-2">
            <Text className="text-[15px] font-semibold text-pn-navy underline">crea una cuenta</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ParkNearBackground>
  );
}
