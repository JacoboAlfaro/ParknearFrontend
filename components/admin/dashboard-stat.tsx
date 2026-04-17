import { Text, View } from 'react-native';

type Props = {
  value: string | number;
  label: string;
  accentClassName?: string;
};

export function DashboardStat({ value, label, accentClassName = 'text-pn-navy' }: Props) {
  return (
    <View className="min-w-[100px] flex-1 rounded-2xl border border-white/60 bg-white/90 px-3 py-3 shadow-sm shadow-pn-navy/10">
      <Text className={`text-2xl font-bold ${accentClassName}`}>{value}</Text>
      <Text className="mt-0.5 text-xs font-medium text-pn-navy/55">{label}</Text>
    </View>
  );
}
