import { View, TextInput, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Input({
  containerStyle,
  style,
  icon,
  placeholder,
  keyboardType,
  secureTextEntry,
  value,
  onChangeText,
  autoCapitalize = 'none',
  autoCorrect = false,
  ...rest
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color="#6b7280"
          style={styles.icon}
        />
      )}

      <TextInput
        style={[styles.input, icon && styles.inputWithIcon, style]}
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#9ca3af"
        value={value}
        onChangeText={onChangeText}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  icon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1f2937',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  inputWithIcon: {
    paddingLeft: 48,
  },
});