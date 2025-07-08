import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getUsers } from '../api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { io } from 'socket.io-client';
import * as ScreenOrientation from 'expo-screen-orientation';


export default function HomeScreen({ navigation }) {





  const SOCKET_URL = 'http://192.168.0.100:3001';
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const onlineSocketRef = useRef(null);
  const [registeredUsers, setRegisteredUsers] = useState(null);

  const queryClient = useQueryClient()


  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });

  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    onlineSocketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('check_connected_users', (response) => {
        if (response?.users) setOnlineUsers(response.users);
      });
    });

    socket.on('disconnect', () => {
      setOnlineUsers([]);
    });

    return () => {
      if (onlineSocketRef.current) {
        onlineSocketRef.current.disconnect();
        onlineSocketRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const socket = onlineSocketRef.current;
    if (!socket) return;

    const handleOnlineUsersUpdate = (userIds) => {
      setOnlineUsers(userIds);
    };

    socket.on('online-users', handleOnlineUsersUpdate);
    return () => socket.off('online-users', handleOnlineUsersUpdate);
  }, []);

  const storePlayerName = async (name, role) => {
    try {
      await AsyncStorage.setItem('name', name);
      await AsyncStorage.setItem('role', role);
      navigation.navigate(role === 'host' ? 'Host' : 'Game');
    } catch (error) {
      alert('فشل في الحفظ.', error);
    }
  };

  const handleRefetch = async () => {
    try {
      const newData = await queryClient.fetchQuery({
        queryKey: ['users'],
        queryFn: getUsers,
      });
      setRegisteredUsers(newData)
    } catch (error) {
      alert('Refresh error');
    }
  };

  useEffect(() => {
    setRegisteredUsers(data)
  }, [data])

  const isUserOnline = (userName) => onlineUsers.includes(userName);
  const filteredUsers =
    registeredUsers?.filter((user) => user.role === selectedRole) || [];



  return (
    <LinearGradient colors={['#00C6FF', '#FBD72B']} style={styles.container}>
      <StatusBar hidden />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.innerContainer}>
          {!selectedRole ? (
            <>
              <Text style={styles.title}>اختر دورك</Text>

              <View style={styles.roleButtons}>
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => setSelectedRole('participant')}
                >
                  <Text style={styles.roleButtonText}>مشارك</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.roleButton}
                  onPress={() => setSelectedRole('host')}
                >
                  <Text style={styles.roleButtonText}>منشط</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.selectionWrapper}>
              <View style={styles.selectionContent}>
                <Text style={styles.title}>
                  اختر {selectedRole === 'host' ? 'منشطاً' : 'مشاركاً'}
                </Text>
                <TouchableOpacity
                  onPress={() => handleRefetch()}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>تحديث</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setSelectedRole(null)}
                  style={styles.backButton}
                >
                  <Text style={styles.backButtonText}>🔙 رجوع</Text>
                </TouchableOpacity>

                {isLoading ? (
                  <Text style={styles.loading}>جاري تحميل المستخدمين...</Text>
                ) : (
                  <FlatList
                    style={styles.flatList}
                    contentContainerStyle={styles.list}
                    data={filteredUsers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.card,
                          isUserOnline(item.name) && styles.disabledCard,
                        ]}
                        onPress={() => storePlayerName(item.name, item.role)}
                        disabled={isUserOnline(item.name)}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.name}>{item.name}</Text>
                          <Text style={styles.role}>({item.role === 'host' ? 'منشط' : 'مشارك'})</Text>
                        </View>
                        {isUserOnline(item.name) && (
                          <Text style={styles.onlineStatus}>متصل</Text>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  selectionContent: {
    alignItems: 'center',
    width: '100%',
    maxHeight: '80%',
    justifyContent: 'center',
  },
  flatList: {
    width: '100%',
  },
  title: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'Hacen',
    marginBottom: 30,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#ffffff50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ffffff80',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Hacen-Samra',
  },
  loading: {
    color: '#000',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 30,
    fontFamily: 'Hacen-Samra',
  },
  list: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingTop: 10,
    marginTop: 30,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#FFE066',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: 300,
  },
  disabledCard: {
    backgroundColor: 'rgba(255,255,255,0.4)',
    opacity: 0.6,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Hacen-Samra',
  },
  role: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
    fontStyle: 'italic',
    fontFamily: 'Hacen-Samra',
  },
  onlineStatus: {
    color: '#2BB673',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'Hacen-Samra',
  },
  roleButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 40,
    width: '100%',
    gap: 20,
  },
  roleButton: {
    backgroundColor: '#FBD72B',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
    textAlign: 'center',
    alignItems: 'center',
  },
  roleButtonText: {
    color: '#000',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Hacen-Samra',
    textAlign: 'center',
    justifyContent: 'center',
    width: 100,
    height: 40
  },
});
