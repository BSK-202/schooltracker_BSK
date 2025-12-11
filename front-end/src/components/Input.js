import {input, TextInput} from 'react-native'
import { StyleSheet } from 'react-native';
export default function Input(props){
    return(
        <TextInput  
        style={styles.input}
        placeholder={props.placeholder}
        keyboardType={props.keyboardType}
        secureTextEntry={props.secure}
    
        ></TextInput>
    )
}
const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 12,
        padding: 12,
        marginVertical: 8,
        fontSize: 16,
        width:300,
    }
})