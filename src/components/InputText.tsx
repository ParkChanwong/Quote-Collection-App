import { useId, useState, type ComponentRef, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import EyeIcon from '../asset/icons/EyeIcon';

export type InputTextProps = TextInputProps & {
  label: string;
  invalid?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export default function InputText({
  label,
  invalid = false,
  secureTextEntry = false,
  containerStyle,
  style,
  ref,
  onFocus,
  onBlur,
  editable = true,
  ...props
}: InputTextProps) {
  const labelId = useId();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={containerStyle}>
      <Text nativeID={labelId} style={styles.label}>
        {label}
      </Text>
      <View
        style={[
          styles.control,
          focused && styles.focused,
          invalid && styles.invalid,
          !editable && styles.disabled,
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          accessibilityLabelledBy={labelId}
          placeholderTextColor="#92988A"
          {...props}
          ref={ref}
          editable={editable}
          secureTextEntry={secureTextEntry && !visible}
          style={[styles.input, style]}
          onFocus={event => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={event => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {secureTextEntry && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? '비밀번호 숨기기' : '비밀번호 보기'}
            accessibilityState={{ disabled: !editable }}
            disabled={!editable}
            onPress={() => setVisible(value => !value)}
            style={styles.visibilityButton}
          >
            <EyeIcon crossed={visible} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#3F5144', fontSize: 12, fontWeight: '600', marginBottom: 9 },
  control: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 54,
    borderWidth: 1,
    borderColor: '#DFE3D7',
    borderRadius: 8,
    backgroundColor: '#FFFFFC',
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 14,
    color: '#243F37',
  },
  focused: { borderColor: '#587557', backgroundColor: '#FAFCF6' },
  invalid: { borderColor: '#A46D4D' },
  disabled: { opacity: 0.6 },
  visibilityButton: {
    minWidth: 52,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
