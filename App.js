// App.js

import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, Button, FlatList, SafeAreaView,
  TouchableOpacity, Modal, Pressable,
  KeyboardAvoidingView, Platform, Keyboard // <<-- 필요한 컴포넌트들을 import 합니다.
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// --- (상수 및 유틸리티 함수, 다른 화면 컴포넌트들은 이전과 동일) ---
const PRAYER_STATUS = { PRAYING: '기도중', ANSWERED: '기도응답', PENDING: '응답대기중' };
const getStatusColor = (status) => {
  switch (status) {
    case PRAYER_STATUS.PRAYING: return '#3498db';
    case PRAYER_STATUS.ANSWERED: return '#2ecc71';
    case PRAYER_STATUS.PENDING: return '#f1c40f';
    default: return '#95a5a6';
  }
};
function HomeScreen() { return (<View style={styles.tabScreen}><Text style={styles.tabScreenText}>환영합니다!</Text><Text>하단 탭을 눌러 이동하세요.</Text></View>); }

// 2. '기도관리' 탭 화면 (이 부분만 수정됩니다)
function PrayerManagementScreen() {
  const [projects, setProjects] = useState([
    {
      id: 'proj1',
      title: '8월 가족 기도',
      createdAt: new Date(2025, 7, 1), // 월은 0부터 시작하므로 7은 8월입니다.
      items: [
        { id: 'item1-1', text: '아버지 건강 회복을 위해', status: PRAYER_STATUS.PRAYING },
        { id: 'item1-2', text: '동생 취업 준비 잘 되도록', status: PRAYER_STATUS.PENDING },
      ],
    },
    {
      id: 'proj2',
      title: '개인적인 성장',
      createdAt: new Date(2025, 6, 28),
      items: [
        { id: 'item2-1', text: 'React Native 공부 꾸준히 하기', status: PRAYER_STATUS.ANSWERED },
      ],
    },
  ]);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [editText, setEditText] = useState('');
  // 기존 newPrayerText, newPrayerStatus State는 삭제
  const [newProjectTitle, setNewProjectTitle] = useState('');
  // 사용자가 입력 중인 기도제목 목록을 관리 (초기값은 빈 제목 1개)
  const [newItems, setNewItems] = useState(['']);

  // 기존 handleAddNewPrayer를 아래 코드로 대체
const handleAddProject = () => {
  // 제목이 없으면 실행하지 않음
  if (newProjectTitle.trim().length === 0) {
    alert('프로젝트 제목을 입력해주세요.');
    return;
  }
  
  // 비어있지 않은 기도제목만 필터링하여 객체로 변환
  const finalItems = newItems
    .map(text => text.trim())
    .filter(text => text.length > 0)
    .map(text => ({
      id: `item-${Date.now()}-${Math.random()}`,
      text: text,
      status: PRAYER_STATUS.PRAYING, // 기본 상태는 '기도중'
    }));

  const newProject = {
    id: `proj-${Date.now()}`,
    title: newProjectTitle,
    createdAt: new Date(),
    items: finalItems,
  };

  setProjects(currentProjects => [newProject, ...currentProjects]);
  setAddModalVisible(false); // 모달 닫기
};

// 사용자가 기도제목 입력칸에서 엔터를 누르거나, 새 칸을 추가할 때 사용될 함수
const handleItemChange = (text, index) => {
  const updatedItems = [...newItems];
  updatedItems[index] = text;
  setNewItems(updatedItems);
};

const addNewItemInput = () => {
  setNewItems([...newItems, '']);
};

  // --- (나머지 CRUD 및 모달 제어 함수들은 이전과 동일) ---
  const removePrayerHandler = () => { if (!selectedPrayer) return; setProjects(currentPrayers => currentPrayers.filter((prayer) => prayer.id !== selectedPrayer.id)); setActionModalVisible(false); };
  const updatePrayerStatus = (newStatus) => { setProjects(currentPrayers => currentPrayers.map(prayer => prayer.id === selectedPrayer.id ? { ...prayer, status: newStatus } : prayer )); setStatusModalVisible(false); };
  const handleUpdatePrayerText = () => { if (!selectedPrayer || editText.length === 0) return; setProjects(currentPrayers => currentPrayers.map(prayer => prayer.id === selectedPrayer.id ? { ...prayer, text: editText } : prayer )); setEditModalVisible(false); };
  const openStatusModal = (prayer) => { setSelectedPrayer(prayer); setStatusModalVisible(true); };
  const openActionModal = (prayer) => { setSelectedPrayer(prayer); setActionModalVisible(true); };
  const openEditModal = () => { if (!selectedPrayer) return; setEditText(selectedPrayer.text); setActionModalVisible(false); setEditModalVisible(true); };
  const openAddModal = () => {
    // 새 프로젝트 제목과 기도제목 목록을 초기화합니다.
    setNewProjectTitle('');
    setNewItems(['']); // 기도제목 입력칸을 빈칸 1개로 초기화
    setAddModalVisible(true);
  };

  // 1. renderPrayerItem 함수를 아래 코드로 교체
  const renderProjectItem = ({ item: project }) => (
    // project.id를 인자로 받는 openDetailModal 함수는 4단계에서 만들 예정입니다.
    <TouchableOpacity style={styles.projectCard} onPress={() => { /* openDetailModal(project) */ }}>
      <View style={styles.projectCardHeader}>
        <Text style={styles.projectCardTitle}>{project.title}</Text>
        {/* project.id를 인자로 받는 openActionModal 함수는 그대로 사용합니다. */}
        <TouchableOpacity onPress={() => openActionModal(project)} style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <View style={styles.projectCardBody}>
        {/* 기도제목은 최대 3개까지만 미리보기로 보여줍니다. */}
        {project.items.slice(0, 3).map(item => (
          <View key={item.id} style={styles.itemPreview}>
            <View style={[styles.itemStatusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.itemPreviewText} numberOfLines={1}>{item.text}</Text>
          </View>
        ))}
        {project.items.length > 3 && <Text style={styles.moreItemsText}>...외 {project.items.length - 3}개 더보기</Text>}
      </View>
      <Text style={styles.projectCardDate}>
        생성일: {new Date(project.createdAt).toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={projects} // 'prayers'를 'projects'로 변경
        renderItem={renderProjectItem} // 'renderPrayerItem'을 'renderProjectItem'으로 변경
        keyExtractor={(item) => item.id}
        style={styles.listContainer} 
        ListEmptyComponent={() => (<View style={styles.emptyListContainer}><Text style={styles.emptyListText}>아직 기도제목이 없네요!</Text><Text style={styles.emptyListText}>아래 + 버튼을 눌러 추가해보세요.</Text></View>)} />
      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* --- 모달 창들 --- */}
      {/* 1. 기도 추가 모달 (프로젝트 생성용) */}
      <Modal visible={addModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
          <Pressable style={styles.modalBackdrop} onPress={Keyboard.dismiss}>
            <Pressable style={styles.modalView}>
              <Text style={styles.modalTitle}>새 기도 프로젝트</Text>
              
              {/* 제목 입력칸 */}
              <TextInput
                placeholder="제목"
                style={styles.editInput}
                onChangeText={setNewProjectTitle}
              />
              
              {/* 기도제목 동적 입력칸 */}
              <FlatList
                data={newItems}
                keyExtractor={(item, index) => `newItem-${index}`}
                renderItem={({ item, index }) => (
                  <TextInput
                    placeholder={`기도제목 ${index + 1}`}
                    style={styles.itemInput}
                    value={item}
                    onChangeText={(text) => handleItemChange(text, index)}
                    // 엔터 누르면 다음 칸으로 포커스 이동 (마지막 칸에서는 새 입력칸 추가)
                    onSubmitEditing={() => {
                      if (index === newItems.length - 1) {
                        addNewItemInput();
                      }
                    }}
                  />
                )}
                // FlatList 스타일링
                style={{ maxHeight: 200, width: '100%' }}
              />
              
              <TouchableOpacity style={styles.addItemButton} onPress={addNewItemInput}>
                <Ionicons name="add-circle-outline" size={24} color="tomato" />
                <Text style={styles.addItemButtonText}>기도제목 추가하기</Text>
              </TouchableOpacity>

              <View style={styles.editButtonContainer}>
                <Button title="취소" color="gray" onPress={() => setAddModalVisible(false)} />
                <Button title="생성" onPress={handleAddProject} />
              </View>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- (나머지 모달 창들은 이전과 동일) --- */}
      <Modal visible={statusModalVisible} transparent={true} animationType="fade"><Pressable style={styles.modalBackdrop} onPress={() => setStatusModalVisible(false)}><Pressable style={styles.modalView}><Text style={styles.modalTitle}>상태 변경</Text>{Object.values(PRAYER_STATUS).map(status => (<TouchableOpacity key={status} style={[styles.modalOptionButton, { backgroundColor: getStatusColor(status), justifyContent: 'center' }]} onPress={() => updatePrayerStatus(status)}><Text style={[styles.modalOptionText, {color: 'white', marginLeft: 0}]}>{status}</Text></TouchableOpacity>))}</Pressable></Pressable></Modal>
      <Modal visible={actionModalVisible} transparent={true} animationType="fade"><Pressable style={styles.modalBackdrop} onPress={() => setActionModalVisible(false)}><Pressable style={styles.modalView}><TouchableOpacity style={styles.modalOptionButton} onPress={openEditModal}><Ionicons name="create-outline" size={20} color="#333" /><Text style={styles.modalOptionText}>수정하기</Text></TouchableOpacity><TouchableOpacity style={[styles.modalOptionButton, {borderTopWidth: 1, borderColor: '#eee'}]} onPress={removePrayerHandler}><Ionicons name="trash-outline" size={20} color="red" /><Text style={[styles.modalOptionText, {color: 'red'}]}>삭제하기</Text></TouchableOpacity></Pressable></Pressable></Modal>
      <Modal visible={editModalVisible} transparent={true} animationType="slide"><Pressable style={styles.modalBackdrop} onPress={() => setEditModalVisible(false)}><Pressable style={styles.modalView}><Text style={styles.modalTitle}>기도 제목 수정</Text><TextInput style={styles.editInput} onChangeText={setEditText} value={editText} multiline /><View style={styles.editButtonContainer}><Button title="취소" color="gray" onPress={() => setEditModalVisible(false)} /><Button title="저장" onPress={handleUpdatePrayerText} /></View></Pressable></Pressable></Modal>
    </SafeAreaView>
  );
}

// --- (나머지 부분은 이전과 동일) ---
function PrayNowScreen() { return (<View style={styles.tabScreen}><Text style={styles.tabScreenText}>기도하기 화면입니다.</Text></View>); }
function PrayerDiaryScreen() { return (<View style={styles.tabScreen}><Text style={styles.tabScreenText}>기도 일기 화면입니다.</Text></View>); }
const Tab = createBottomTabNavigator();
export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator screenOptions={({ route }) => ({ headerShown: false, tabBarIcon: ({ focused, color, size }) => { let iconName; if (route.name === '홈') iconName = focused ? 'home' : 'home-outline'; else if (route.name === '기도관리') iconName = focused ? 'list-circle' : 'list-circle-outline'; else if (route.name === '기도하기') iconName = focused ? 'flame' : 'flame-outline'; else if (route.name === '기도일기') iconName = focused ? 'book' : 'book-outline'; return <Ionicons name={iconName} size={size} color={color} />; }, tabBarActiveTintColor: 'tomato', tabBarInactiveTintColor: 'gray', })} >
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
  // ... (이전 스타일 대부분 동일)
  container: { flex: 1, backgroundColor: '#fff' },
  tabScreen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' },
  tabScreenText: { fontSize: 20, fontWeight: 'bold' },
  listContainer: { flex: 1 },
  emptyListContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyListText: { fontSize: 16, color: 'gray' },
  projectCard: {
  backgroundColor: '#ffffe0', // 포스트잇 느낌의 연노랑색
  borderRadius: 8,
  padding: 15,
  marginVertical: 8,
  marginHorizontal: 10,
  elevation: 3,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 2,
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0c0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  projectCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  projectCardBody: {
    minHeight: 50,
  },
  itemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  itemPreviewText: {
    fontSize: 14,
    color: '#555',
  },
  moreItemsText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 5,
  },
  projectCardDate: {
    fontSize: 12,
    color: 'gray',
    marginTop: 10,
    textAlign: 'right',
  },
  itemInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '100%',
    marginBottom: 10,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    alignSelf: 'center',
  },
  addItemButtonText: {
    color: 'tomato',
    marginLeft: 5,
    fontSize: 16,
  },
  prayerText: { fontSize: 16, marginBottom: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, alignSelf: 'flex-start' },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  menuButton: { padding: 5 },
  fab: { borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, position: 'absolute', bottom: 20, right: 20, backgroundColor: 'tomato', borderRadius: 30, elevation: 8, shadowColor: '#000', shadowRadius: 5, shadowOpacity: 0.3, shadowOffset: { height: 2, width: 0 } },
  
  // <<-- 이 부분이 추가/수정되었습니다.
  keyboardAvoidingContainer: { flex: 1 },
  modalBackdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 15, padding: 20, width: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5 },
  modalTitle: { marginBottom: 20, textAlign: 'center', fontSize: 18, fontWeight: 'bold' },
  modalOptionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 10, borderRadius: 10, marginBottom: 5 },
  modalOptionText: { fontSize: 16, marginLeft: 10 },
  editInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 10, marginBottom: 20, fontSize: 16 },
  editButtonContainer: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  statusSelectTitle: { fontSize: 16, fontWeight: '500', marginBottom: 10 },
  statusSelectContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  statusSelectItem: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 15 },
  statusSelectedItem_Selected: { borderWidth: 2, borderColor: '#333' },
  statusSelectItemText: { color: 'white', fontWeight: 'bold' },
});
