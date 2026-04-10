import { Text, View } from 'react-native';

type Props = {
  compact?: boolean;
  prominent?: boolean;
};

export function BrandingHeader({ compact, prominent }: Props) {
  const titleSize =
    prominent && compact ? 'text-[36px]' : compact ? 'text-[28px]' : 'text-4xl';
  const sloganSize =
    prominent && compact
      ? 'mt-2 text-[19px] font-semibold'
      : compact
        ? 'mt-1 text-[15px] font-medium'
        : 'mt-1.5 text-[17px] font-medium';

  return (
    <View className={`items-center ${compact ? 'mb-5' : 'mb-7'}`}>
      <Text className={`font-extrabold text-pn-navy ${titleSize} tracking-tight`}>ParkNear</Text>
      <Text className={`text-pn-slogan ${sloganSize}`}>Tu espacio, cerca.</Text>
    </View>
  );
}
