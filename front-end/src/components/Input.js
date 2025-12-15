import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Input(props) {
    return (
        <View style={[styles.container, props.containerStyle]}>
            {props.icon && (
                <Ionicons 
                    name={props.icon} 
                    size={20} 
                    color="#7f8c8d" 
                    style={styles.icon} 
                />
            )}
            <TextInput 
                style={[
                    styles.input,
                    props.icon && styles.inputWithIcon,
                    props.style
                ]}
                placeholder={props.placeholder}
                keyboardType={props.keyboardType}
                secureTextEntry={props.secureTextEntry}
                placeholderTextColor="#7f8c8d"
                value={props.value}
                onChangeText={props.onChangeText}
                autoCapitalize={props.autoCapitalize || 'none'}
                autoCorrect={false}
                {...props}
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
        left: 15,
        zIndex: 10,
    },
    input: {
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: '#bdc3c7',
        borderRadius: 12,
        padding: 16,
        marginVertical: 10,
        fontSize: 16,
        width: '100%',
        maxWidth: 350,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    inputWithIcon: {
        paddingLeft: 45, // Espace pour l'icône
    }
});