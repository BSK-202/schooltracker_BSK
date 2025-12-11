import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import Input from '../components/Input';

export default function Login(props) {

    return (

        <View style={styles.container}>
            <View style={{ position: 'absolute', top: 70, left: 20 }}>

                <TouchableOpacity onPress={() => props.navigation.navigate('Home')}>
                    <Text style={styles.back}>←</Text>
                </TouchableOpacity>
            </View>
            <Text>Welcome to School Tracker!</Text>

            <View >
                <Image
                    source={require('../../assets/logo_bus.png')}
                    style={{ width: 300, height: 300 }}
                />
            </View>
            <Input
                placeholder='Saisire votre email'
                keyboardType='email-address'
            />
            <Input
                placeholder='Saisire votre mot de passe'
                keyboardType='password'
                secureTextEntry={true}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200
    }
});
