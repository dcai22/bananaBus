import { Ionicons } from '@expo/vector-icons';
import { set } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

interface StyledInputProps extends TextInputProps {
  password?: boolean;
  style?: StyleProp<TextStyle>;
}


// TODO: probs replace all text Input with the one from react native paper
// label better than placeholder for accessibility
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
        {...props}
      />
      { password && (
        <TouchableOpacity onPress={toggleTextVisibility} style={styles.eyeIcon}>
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