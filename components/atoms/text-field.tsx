import { useState } from 'react';
import { TextInput, type TextInputProps } from 'react-native';

import { ParkNearColors } from '@/constants/parknear-theme';

const base = 'rounded-2xl border bg-pn-white/95 px-4 py-3.5 text-base text-pn-navy';

export type TextFieldProps = TextInputProps & {
  className?: string;
};

export function TextField({
  className = '',
  onFocus,
  onBlur,
  placeholderTextColor,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const border = focused
    ? 'border-2 border-pn-navy/30'
    : 'border border-pn-border/60';

  return (
    <TextInput
      className={`${base} ${border} ${className}`.trim()}
      placeholderTextColor={placeholderTextColor ?? ParkNearColors.inputBorder}
      onFocus={(e) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e) => {
        setFocused(false);
        onBlur?.(e);
      }}
      {...rest}
    />
  );
}
