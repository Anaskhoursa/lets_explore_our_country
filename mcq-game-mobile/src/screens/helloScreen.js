import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react"
import { View, Text, FlatList, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { useSocketStore } from "../socketStore";

const HelloScreen = ({ navigation }) => {
    const [name, setName] = useState('')
    const [role, setRole] = useState('')

    const { socket } = useSocketStore()




    useEffect(() => {
        async function getDetails() {
            const name = await AsyncStorage.getItem('name');
            const role = await AsyncStorage.getItem('role');
            navigation.navigate(role === 'host' ? 'Host' : 'Game')

            setName(name)
            setRole(role)
        }

        getDetails()


    }, [])





    return (
        <LinearGradient
            colors={['#1e3c72', '#2a5298']}
            style={styles.container}
        >
            <StatusBar barStyle="light-content" />

            {!name || !role ? (
                <Text style={styles.loading}>جاري تحميل...</Text>
            ) : (
                <View>
                    <Text style={styles.loading}>جاري تحميل...</Text>
                </View>
            )}
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: StatusBar.currentHeight + 20,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 50,
        textAlign: 'center',
    },
    loading: {
        color: '#fff',
        fontSize: 18,
        textAlign: 'center',
    },


    name: {
        fontSize: 22,
        fontWeight: '600',
        color: '#fff',
    },

    role: {
        fontSize: 14,
        color: '#ccc',
        marginTop: 2,
        fontStyle: 'italic',
    },
});

export default HelloScreen;
