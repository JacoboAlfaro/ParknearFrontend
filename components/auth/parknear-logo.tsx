import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { ParkNearColors } from '@/constants/parknear-theme';

type Props = {
  size?: number;
};

export function ParkNearLogo({ size = 140 }: Props) {
  const w = size * 1.15;
  const h = size * 1.2;
  return (
    <View style={[styles.wrap, { width: w, height: h }]}>
      <Svg width={w} height={h} viewBox="0 0 115 120">
        <Path
          d="M 18 52 Q 18 28 42 22 Q 57 18 73 22 Q 97 28 97 52 Q 97 72 57 108 Q 18 72 18 52 Z"
          fill={ParkNearColors.navy}
        />
        <Path
          d="M 44 50 L 71 50 L 69 60 L 46 60 Z"
          fill={ParkNearColors.lightAccent}
        />
        <Path
          d="M 48 56 L 50 62 L 65 62 L 67 56 Z"
          fill={ParkNearColors.lightAccent}
          opacity={0.85}
        />
        <Path
          d="M 12 38 Q 42 8 95 32"
          stroke={ParkNearColors.lightAccent}
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
        <Circle cx={95} cy={32} r={4} fill={ParkNearColors.lightAccent} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
