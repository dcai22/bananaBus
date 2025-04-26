import { FontAwesome, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, View } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

interface StyledInputProps extends TextInputProps {
  password?: boolean;
  style?: StyleProp<TextStyle>;
}

/**
 * StyledTextInput Component
 * 
 * A reusable text input component with optional password visibility toggle and read-only mode.
 * 
 * Props:
 * - `password` (boolean, optional): If true, the input will be treated as a password field with a
 *        visibility toggle, also turns autocaps off. Defaults to false.
 * - `style` (StyleProp<TextStyle>, optional): Custom styles to apply to the text input container.
 * - `readOnly` (boolean, optional): If true, the input will be read-only. Defaults to false.
 * 
 * Example Usage:
 * <StyledTextInput password={true} placeholder="Enter your password" />
 */
export default function StyledTextInput({
  style,
  readOnly,
  password = false,
  ...props
}: StyledInputProps) {

  const [isTextVisible, setIsTextVisible] = useState(true);
  
  useEffect(() => {
    if (password) setIsTextVisible(false)
  }, [])

  const toggleTextVisibility = () => {
    setIsTextVisible(!isTextVisible);
  };



  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        dense
        style={[styles.inputContainer, style,]}
        outlineColor="#ccc"
        activeOutlineColor="#2A8AE4"
        outlineStyle={[styles.inputOutline, (readOnly && styles.inputOutlineRead)]}
        contentStyle={styles.inputContent}
        readOnly={readOnly}
        secureTextEntry={!isTextVisible}
        autoCapitalize={password ? "none" : props.autoCapitalize}
        {...props}
        testID='text-input'
      />
      { password && (
        <TouchableOpacity onPress={toggleTextVisibility} style={styles.eyeIcon} testID='eye-icon'>
            <Ionicons
                name={isTextVisible ? "eye-off" : "eye"}
                size={20}
                color="#ccc"
            />
        </TouchableOpacity>
        )
      }
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        backgroundColor: "white",
        paddingBottom: 5,
        paddingHorizontal: 6,
        borderRadius: 14,
        marginVertical: 8,
    },
    inputContainer: {
      backgroundColor: 'white',
      borderRadius: 10,
      width: "100%",
    },
    inputOutline: {
      borderRadius: 10
    },
    inputOutlineRead: {
      borderWidth: 0
    },
    inputContent: {
      paddingVertical: 15,
    },
    eyeIcon: {
        position: "absolute",
        right: 4,
        padding: 10,
    },
});