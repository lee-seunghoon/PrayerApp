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
import { createStackNavigator } from '@react-navigation/stack';

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

function ProjectDetailScreen({ route, navigation }) {
  // route.params 로 이전 화면에서 넘겨준 데이터를 받습니다.
  const { projectId } = route.params;

  // UI는 아래 4단계에서 채울 것입니다.
  return (
    <SafeAreaView style={styles.container}>
      <Text>프로젝트 상세 화면</Text>
      <Text>프로젝트 ID: {projectId}</Text>
      {/* 뒤로가기 버튼 */}
      <Button title="목록으로 돌아가기" onPress={() => navigation.goBack()} />
    </SafeAreaView>
  );
}

// 2. '기도관리' 탭 화면 (이 부분만 수정됩니다)
function PrayerManagementScreen({navigation, projects, openAddModal, openActionModal}) {

  // 1. renderPrayerItem 함수를 아래 코드로 교체
  const renderProjectItem = ({ item: project }) => (
    <TouchableOpacity 
      style={styles.projectCard} 
      onPress={() => navigation.navigate('ProjectDetail', { projectId: project.id })}
    >
      <View style={styles.projectCardHeader}>
        <Text style={styles.projectCardTitle}>{project.title}</Text>
        <TouchableOpacity onPress={() => openActionModal(project)} style={styles.menuButton}>
          <Ionicons name="ellipsis-horizontal" size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <View style={styles.projectCardBody}>
        {project.items.slice(0, 3).map(item => (
          <View key={item.id} style={styles.itemPreview}>
            <View style={[styles.itemStatusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
            <Text style={styles.itemPreviewText} numberOfLines={1}>{item.text}</Text>
          </View>
        ))}
        {project.items.length > 3 && <Text style={styles.moreItemsText}>...외 {project.items.length - 3}개 더보기</Text>}
      </View>
      <Text style={styles.projectCardDate}>
        생성일: {new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, }).format(new Date(project.createdAt))}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>기도관리</Text>
      </View>

      <FlatList
        data={projects} // 'prayers'를 'projects'로 변경
        renderItem={renderProjectItem} // 'renderPrayerItem'을 'renderProjectItem'으로 변경
        keyExtractor={(item) => item.id}
        style={styles.listContainer} 
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <Text style={styles.emptyListText}>아직 기도제목이 없네요!</Text>
            <Text style={styles.emptyListText}>아래 + 버튼을 눌러 추가해보세요.</Text>
          </View>
        )} 
      />

      <View style={styles.bottomBarContainer}>
        {/* 범례 부분 */}
        <View style={styles.legendContainer}>
          {Object.entries(PRAYER_STATUS).map(([key, value]) => (
            <View key={key} style={styles.legendItem}>
              <View style={[styles.itemStatusIndicator, { backgroundColor: getStatusColor(value) }]} />
              <Text style={styles.legendText}>{value}</Text>
            </View>
          ))}
        </View>
        {/* + 버튼 부분 */}
        <TouchableOpacity style={styles.fab} onPress={openAddModal}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- (나머지 부분은 이전과 동일) ---
function PrayNowScreen() { return (<View style={styles.tabScreen}><Text style={styles.tabScreenText}>기도하기 화면입니다.</Text></View>); }
function PrayerDiaryScreen() { return (<View style={styles.tabScreen}><Text style={styles.tabScreenText}>기도 일기 화면입니다.</Text></View>); }

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// 탭 네비게이터를 별도의 컴포넌트로 분리합니다.
function MainTabs({ navigation, projects, openAddModal, openActionModal }) {
  return (
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
      <Tab.Screen name="기도관리">
        {(props) => <PrayerManagementScreen {...props} navigation={navigation} projects={projects} openAddModal={openAddModal} openActionModal={openActionModal} />}
      </Tab.Screen>
      <Tab.Screen name="기도하기" component={PrayNowScreen} />
      <Tab.Screen name="기도일기" component={PrayerDiaryScreen} />
    </Tab.Navigator>
  );
}

// 우리 앱 전체의 시작이자 최상위 부품 App 함수
export default function App() {
  // --- PrayerManagementScreen에서 가져온 모든 State와 함수들 ---
  const [projects, setProjects] = useState([
    { id: 'proj1', title: '8월 가족 기도', createdAt: new Date(2025, 7, 1), items: [ { id: 'item1-1', text: '아버지 건강 회복을 위해', status: PRAYER_STATUS.PRAYING }, { id: 'item1-2', text: '동생 취업 준비 잘 되도록', status: PRAYER_STATUS.PENDING }, ], },
    { id: 'proj2', title: '개인적인 성장', createdAt: new Date(2025, 6, 28), items: [ { id: 'item2-1', text: 'React Native 공부 꾸준히 하기', status: PRAYER_STATUS.ANSWERED }, ], },
  ]);
  const [selectedPrayer, setSelectedPrayer] = useState(null);
  
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);

  const [editText, setEditText] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newItems, setNewItems] = useState(['']);

  const handleAddProject = () => {
    if (newProjectTitle.trim().length === 0) { alert('프로젝트 제목을 입력해주세요.'); return; }
    const finalItems = newItems.map(text => text.trim()).filter(text => text.length > 0).map(text => ({ id: `item-${Date.now()}-${Math.random()}`, text: text, status: PRAYER_STATUS.PRAYING, }));
    const newProject = { id: `proj-${Date.now()}`, title: newProjectTitle, createdAt: new Date(), items: finalItems, };
    setProjects(currentProjects => [...currentProjects, newProject]);
    setAddModalVisible(false);
  };
  const handleItemChange = (text, index) => { const updatedItems = [...newItems]; updatedItems[index] = text; setNewItems(updatedItems); };
  const addNewItemInput = () => { setNewItems([...newItems, '']); };
  const removePrayerHandler = () => { if (!selectedPrayer) return; setProjects(currentPrayers => currentPrayers.filter((prayer) => prayer.id !== selectedPrayer.id)); setActionModalVisible(false); };
  const updatePrayerStatus = (newStatus) => { setProjects(currentPrayers => currentPrayers.map(prayer => prayer.id === selectedPrayer.id ? { ...prayer, status: newStatus } : prayer )); setStatusModalVisible(false); };
  const handleUpdatePrayerText = () => { if (!selectedPrayer || editText.length === 0) return; setProjects(currentPrayers => currentPrayers.map(prayer => prayer.id === selectedPrayer.id ? { ...prayer, text: editText } : prayer )); setEditModalVisible(false); };
  const openStatusModal = (prayer) => { setSelectedPrayer(prayer); setStatusModalVisible(true); };
  const openActionModal = (prayer) => { setSelectedPrayer(prayer); setActionModalVisible(true); };
  const openEditModal = () => { if (!selectedPrayer) return; setEditText(selectedPrayer.text); setActionModalVisible(false); setEditModalVisible(true); };
  const openAddModal = () => { setNewProjectTitle(''); setNewItems(['']); setAddModalVisible(true); };
  // --- 여기까지가 옮겨온 코드들입니다 ---

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Main" options={{ headerShown: false }}>
            {(props) => <MainTabs {...props} projects={projects} openAddModal={openAddModal} openActionModal={openActionModal} />}
          </Stack.Screen>
          <Stack.Screen name="ProjectDetail" options={{ title: '프로젝트 상세 보기' }}>
            {(props) => <ProjectDetailScreen {...props} projects={projects} />}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
      
      {/* --- App 컴포넌트가 직접 관리하는 전역 모달 창들 --- */}
      <Modal visible={addModalVisible} transparent={true} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingContainer}>
          <Pressable style={styles.modalBackdrop} onPress={Keyboard.dismiss}>
            <Pressable style={styles.modalView}>
              <Text style={styles.modalTitle}>새 기도 프로젝트</Text>
              <TextInput placeholder="제목" style={styles.editInput} onChangeText={setNewProjectTitle} />
              <FlatList data={newItems} keyExtractor={(item, index) => `newItem-${index}`} renderItem={({ item, index }) => ( <TextInput placeholder={`기도제목 ${index + 1}`} style={styles.itemInput} value={item} onChangeText={(text) => handleItemChange(text, index)} onSubmitEditing={() => { if (index === newItems.length - 1) { addNewItemInput(); } }} /> )} style={{ maxHeight: 200, width: '100%' }} />
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

      {/* 여기에 다른 전역 모달들도 필요하다면 추가할 수 있습니다. */}
    </>
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
  header: {
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  // 1. 새로운 컨테이너 스타일 추가
  bottomBarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  // 2. 기존 legendContainer 스타일 수정
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15, // 아이템 간 간격
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#333',
  },
  
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'gray',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  detailItemText: {
    fontSize: 16,
    flex: 1,
  },

  prayerText: { fontSize: 16, marginBottom: 8 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 10, alignSelf: 'flex-start' },
  statusText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  menuButton: { padding: 5 },
  // 3. 기존 fab 스타일 수정 (position: 'absolute' 속성 제거)
  fab: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 55,
    height: 55,
    backgroundColor: 'tomato',
    borderRadius: 30,
    elevation: 4,
  },
  
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
