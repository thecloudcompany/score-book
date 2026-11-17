import { useState, type ComponentProps } from 'react';
import { TextInput } from 'react-native';
import { s } from './app-input.styles';

export function AppInput({ style, onFocus, onBlur, ...props }: ComponentProps<typeof TextInput>) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      style={[s.base, focused && s.focused, style]}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
    />
  );
}
