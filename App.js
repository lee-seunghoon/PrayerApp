// App.js

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, Button, FlatList, SafeAreaView,
  TouchableOpacity, Modal, Pressable
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- 상수 및 유틸리티 함수 ---
const PRAYER_STATUS = {
  PRAYING: '기도중',
  ANSWERED: '기도응답',
  PENDING: '응답대기중',
};

const getStatusColor = (status) => {
  switch (status) {
    case PRAYER_STATUS.PRAYING: return '#3498db';
    case PRAYER_STATUS.ANSWERED: return '#2ecc71';
    case PRAYER_STATUS.PENDING: return '#f1c40f';
    default: return '#95a5a6';
  }
};

// 1. '홈' 탭 화면 (이제 비어있는 화면입니다)
function HomeScreen() {
  return (
    <View style={styles.tabScreen}>
      <Text style={styles.tabScreenText}>환영합니다!</Text>
      <Text>하단 탭을 눌러 이동하세요.</Text>
    </View>
  );
}

// 2. '기도관리' 탭 화면 (핵심 기능이 모두 여기로 이동했습니다)
function PrayerManagementScreen() {
  // --- State 설정 ---
  const [prayers, setPrayers] = useState([
    { id: '1', text: '가족의 건강을 위해', status: PRAYER_STATUS.PRAYING },
    { id: '2', text: '새로운 프로젝트 성공을 위해', status: PRAYER_STATUS.ANSWERED },
    { id: '3', text: '내일 면접 잘 보게 해주세요', status: PRAYER_STATUS.PENDING },
  ]);
  const [inputText, setInputText] = useState('');
  const [selectedPrayer, setSelectedPrayer] = useState(null); // 사용자가 선택한 기도 제목
  
  // 모달 상태 관리
  const [statusModalVisible, setStatusModalVisible] = useState(false); // 상태 변경 모달
  const [actionModalVisible, setActionModalVisible] = useState(false); // 수정/삭제 선택 모달
  const [editModalVisible, setEditModalVisible] = useState(false); // 텍스트 수정 모달
  const [editText, setEditText] = useState(''); // 수정할 텍스트

  // --- CRUD 함수들 ---
  const addPrayerHandler = () => {
    if (inputText.length === 0) return;
    setPrayers(currentPrayers => [
      ...currentPrayers,
      { id: Math.random().toString(), text: inputText, status: PRAYER_STATUS.PRAYING },
    ]);
    setInputText('');
  };

  const removePrayerHandler = () => {
    if (!selectedPrayer) return;
    setPrayers(currentPrayers => currentPrayers.filter((prayer) => prayer.id !== selectedPrayer.id));
    setActionModalVisible(false); // 모달 닫기
  };

  const updatePrayerStatus = (newStatus) => {
    setPrayers(currentPrayers =>
      currentPrayers.map(prayer =>
        prayer.id === selectedPrayer.id ? { ...prayer, status: newStatus } : prayer
      )
    );
    setStatusModalVisible(false);
  };

  const handleUpdatePrayerText = () => {
    if (!selectedPrayer || editText.length === 0) return;
    setPrayers(currentPrayers =>
      currentPrayers.map(prayer =>
        prayer.id === selectedPrayer.id ? { ...prayer, text: editText } : prayer
      )
    );
    setEditModalVisible(false);
  };

  // --- 모달 제어 함수들 ---
  const openStatusModal = (prayer) => {
    setSelectedPrayer(prayer);
    setStatusModalVisible(true);
  };

  const openActionModal = (prayer) => {
    setSelectedPrayer(prayer);
    setActionModalVisible(true);
  };

  const openEditModal = () => {
    if (!selectedPrayer) return;
    setEditText(selectedPrayer.text); // 현재 텍스트를 수정창에 미리 채워넣기
    setActionModalVisible(false); // 액션 모달은 닫고
    setEditModalVisible(true);   // 수정 모달을 연다
  };

  // --- 렌더링 부분 ---
  const renderPrayerItem = ({ item }) => (
    <View style={styles.prayerItem}>
      <View style={styles.prayerInfo}>
        <Text style={styles.prayerText}>{item.text}</Text>
        <TouchableOpacity onPress={() => openStatusModal(item)}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </TouchableOpacity>
      </View>
      {/* '삭제' 버튼 대신 '...' 아이콘 버튼으로 변경된 부분입니다 */}
      <TouchableOpacity onPress={() => openActionModal(item)} style={styles.menuButton}>
        <Ionicons name="ellipsis-horizontal" size={24} color="gray" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="새 기도 제목을 입력하세요"
          style={styles.input}
          onChangeText={setInputText}
          value={inputText}
        />
        <Button title="추가" onPress={addPrayerHandler} />
      </View>
      <FlatList
        data={prayers}
        renderItem={renderPrayerItem}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
      />
      <Modal visible={statusModalVisible} transparent={true} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setStatusModalVisible(false)}>
          <Pressable style={styles.modalView}>
            <Text style={styles.modalTitle}>상태 변경</Text>
            {Object.values(PRAYER_STATUS).map(status => (
              <TouchableOpacity key={status} style={[styles.modalOptionButton, { backgroundColor: getStatusColor(status), justifyContent: 'center' }]} onPress={() => updatePrayerStatus(status)}>
                <Text style={[styles.modalOptionText, {color: 'white', marginLeft: 0}]}>{status}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={actionModalVisible} transparent={true} animationType="fade">
        <Pressable style={styles.modalBackdrop} onPress={() => setActionModalVisible(false)}>
          <Pressable style={styles.modalView}>
            <TouchableOpacity style={styles.modalOptionButton} onPress={openEditModal}>
              <Ionicons name="create-outline" size={20} color="#333" />
              <Text style={styles.modalOptionText}>수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOptionButton, {borderTopWidth: 1, borderColor: '#eee'}]} onPress={removePrayerHandler}>
              <Ionicons name="trash-outline" size={20} color="red" />
              <Text style={[styles.modalOptionText, {color: 'red'}]}>삭제하기</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
      <Modal visible={editModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>기도 제목 수정</Text>
            <TextInput style={styles.editInput} onChangeText={setEditText} value={editText} multiline />
            <View style={styles.editButtonContainer}>
              <Button title="취소" color="gray" onPress={() => setEditModalVisible(false)} />
              <Button title="저장" onPress={handleUpdatePrayerText} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// 3. '기도하기' 탭 화면 (임시)
function PrayNowScreen() {
  return (
    <View style={styles.tabScreen}>
      <Text style={styles.tabScreenText}>기도하기 화면입니다.</Text>
    </View>
  );
}

// 4. '기도일기' 탭 화면 (임시)
function PrayerDiaryScreen() {
  return (
    <View style={styles.tabScreen}>
      <Text style={styles.tabScreenText}>기도 일기 화면입니다.</Text>
    </View>
  );
}


// --- 하단 탭 네비게이터 ---
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false, 
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === '홈') iconName = focused ? 'home' : 'home-outline';
            else if (route.name === '기도관리') iconName = focused ? 'list-circle' : 'list-circle-outline';
            else if (route.name === '기도하기') iconName = focused ? 'flame' : 'flame-outline';
            else if (route.name === '기도일기') iconName = focused ? 'book' : 'book-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="홈" component={HomeScreen} />
        <Tab.Screen name="기도관리" component={PrayerManagementScreen} />
        <Tab.Screen name="기도하기" component={PrayNowScreen} />
        <Tab.Screen name="기도일기" component={PrayerDiaryScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// --- 스타일 정의 ---
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  tabScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  tabScreenText: { fontSize: 20, fontWeight: 'bold' },
  inputContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  input: { flex: 1, borderWidth: 1, borderColor: '#cccccc', padding: 10, borderRadius: 5, marginRight: 10 },
  listContainer: { flex: 1 },
  prayerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  prayerInfo: { flex: 1, marginRight: 10 },
  prayerText: { fontSize: 16, marginBottom: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, alignSelf: 'flex-start' },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  menuButton: { padding: 5 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 15, padding: 20, width: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { marginBottom: 20, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  modalOptionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, marginBottom: 5 },
  modalOptionText: { fontSize: 16, marginLeft: 10 },
  editInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, minHeight: 80, textAlignVertical: 'top', marginBottom: 20},
  editButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end'},
});