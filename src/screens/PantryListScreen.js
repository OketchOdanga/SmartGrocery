import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePantry } from '../contexts/PantryContext';
import AddEditItemScreen from './AddEditItemScreen';
import { formatDisplayDate } from '../utils/date';

export default function PantryListScreen() {
  const { items, deleteItem } = usePantry();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleDelete = (id, name) => {
    Alert.alert(
    'Delete Item',
    `Are you sure you want to delete "${name}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        onPress: async () => {
          try {
            await deleteItem(id);
            Alert.alert('Success', 'Item deleted');
          } catch (error) {
            console.error("Delete failed:", error);
            Alert.alert('Error', error.message);
          }
        },
        style: 'destructive'
      }
    ]
  );
};

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.quantity}>Qty: {item.quantity}</Text>
      </View>
      <Text style={styles.detail}>Category: {item.category}</Text>
      <Text style={styles.detail}>Expires: {formatDisplayDate(item.expirationDate)}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity 
          style={[styles.smallButton, styles.editButton]} 
          onPress={() => {
            setEditingItem(item);
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.smallButton, styles.deleteButton]} 
          onPress={() => handleDelete(item.id, item.name)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Your pantry is empty. Add items!</Text>}
        contentContainerStyle={styles.list}
      />
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => {
          setEditingItem(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+ Add Item</Text>
      </TouchableOpacity>
      <AddEditItemScreen 
        visible={modalVisible} 
        onClose={() => {
          setModalVisible(false);
          setEditingItem(null);
        }} 
        item={editingItem} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 18, fontWeight: 'bold' },
  quantity: { fontSize: 16, color: '#666' },
  detail: { fontSize: 14, color: '#666', marginBottom: 4 },
  buttonRow: { flexDirection: 'row', marginTop: 10, justifyContent: 'flex-end' },
  smallButton: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 6, marginLeft: 10 },
  editButton: { backgroundColor: '#2196F3' },
  deleteButton: { backgroundColor: '#f44336' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  addButton: { backgroundColor: '#4CAF50', padding: 16, margin: 16, borderRadius: 10, alignItems: 'center' },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' }
});