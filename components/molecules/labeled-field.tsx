import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Text, View, type TextInputProps } from 'react-native';

import { TextField } from '@/components/atoms/text-field';
import { ParkNearColors } from '@/constants/parknear-theme';

type InputProps = TextInputProps & { className?: string };

export type LabeledFieldProps = Omit<InputProps, 'className' | 'secureTextEntry'> & {
  label: string;
  containerClassName?: string;
  inputClassName?: string;
  className?: string;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
};

export function LabeledField({
  label,
  containerClassName = 'mb-2',
  inputClassName,
  className,
  showPasswordToggle,
  secureTextEntry,
  ...inputProps
}: LabeledFieldProps) {
  const [passwordHidden, setPasswordHidden] = useState(true);
  const mergedInputClass = [inputClassName, className, showPasswordToggle ? 'pr-12' : '']
    .filter(Boolean)
    .join(' ');

  const effectiveSecure =
    showPasswordToggle === true ? passwordHidden : (secureTextEntry ?? false);

  const field = (
    <TextField
      className={mergedInputClass || undefined}
      secureTextEntry={effectiveSecure}
      {...inputProps}
      {...(showPasswordToggle ? { autoCorrect: false } : {})}
    />
  );

  return (
    <View className={containerClassName}>
      <Text className="mb-1.5 ml-1 text-xs font-medium text-pn-navy/55">{label}</Text>
      {showPasswordToggle ? (
        <View className="relative w-full">
          {field}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={passwordHidden ? 'Mostrar contraseña' : 'Ocultar contraseña'}
            hitSlop={10}
            onPress={() => setPasswordHidden((h) => !h)}
            className="absolute bottom-0 right-2 top-0 justify-center px-1 active:opacity-60">
            <Ionicons
              name={passwordHidden ? 'eye-outline' : 'eye-off-outline'}
              size={22}
              color={ParkNearColors.navy}
              style={{ opacity: 0.55 }}
            />
          </Pressable>
        </View>
      ) : (
        field
      )}
    </View>
  );
}
