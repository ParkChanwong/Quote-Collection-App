import { Pressable, StyleSheet, Text, type PressableProps } from 'react-native';

export type PrimaryButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
};

export default function PrimaryButton({
  title,
  style,
  disabled,
  accessibilityState,
  ...props
}: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...props}
      disabled={disabled}
      accessibilityState={{ ...accessibilityState, disabled: !!disabled }}
      style={state => [
        styles.button,
        state.pressed && styles.pressed,
        disabled && styles.disabled,
        typeof style === 'function' ? style(state) : style,
      ]}
    >
      <Text style={styles.title}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: '#284D40',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 44,
    paddingVertical: 15,
  },
  pressed: { backgroundColor: '#1C3E32' },
  disabled: { opacity: 0.5 },
  title: { color: '#FFFEFA', fontSize: 14, fontWeight: '600' },
});
