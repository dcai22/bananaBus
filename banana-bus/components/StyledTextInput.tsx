import React from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { TextInput, TextInputProps } from 'react-native-paper';

interface StyledInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}


// TODO: probs replace all text Input with the one from react native paper
// label better than placeholder for accessibility
export default function StyledTextInput({
  style,
  readOnly,
  ...props
}: StyledInputProps) {
  return (
    <TextInput
      mode="outlined"
      style={[
        {
          marginBottom: 10,
          backgroundColor: 'white',
          borderRadius: 10,
        },
        style,
      ]}
      activeOutlineColor="#2A8AE4"
      outlineStyle={[{ borderRadius: 10}, readOnly && { borderWidth: 0 }]}
      contentStyle={{ paddingVertical: 10 }}
      readOnly={readOnly}
      {...props}
    />
  );
}