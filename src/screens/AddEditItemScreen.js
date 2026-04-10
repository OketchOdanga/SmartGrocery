import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, Modal
} from 'react-native';
import { usePantry } from '../contexts/PantryContext';

const categories = ['Dairy', 'Vegetables', 'Fruits', 'Grains', 'Meat', 'Snacks', 'Beverages', 'Other'];

// Helper to convert Firestore timestamp or Date to YYYY-MM-DD string
const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  try {
    let date;
    if (dateValue.toDate) {
      // Firestore Timestamp
      date = dateValue.toDate();
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else {
      return '';
    }
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
};

export default function AddEditItemScreen({ visible, onClose, item }) {
  const { addItem, updateItem } = usePantry();
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    category: categories[0],
    purchaseDate: '',
    expirationDate: ''
  });

  // Populate form when item changes (for editing)
  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        quantity: item.quantity?.toString() || '',
        category: item.category || categories[0],
        purchaseDate: formatDateForInput(item.purchaseDate),
        expirationDate: formatDateForInput(item.expirationDate)
      });
    } else {
      setFormData({
        name: '',
        quantity: '',
        category: categories[0],
        purchaseDate: '',
        expirationDate: ''
      });
    }
  }, [item]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.quantity || !formData.expirationDate) {
      Alert.alert('Error', 'Please fill name, quantity, and expiration date');
      return;
    }

    const quantityNum = parseInt(formData.quantity);
    if (isNaN(quantityNum) || quantityNum < 0) {
      Alert.alert('Error', 'Quantity must be a positive number');
      return;
    }

    const data = {
      name: formData.name,
      quantity: quantityNum,
      category: formData.category,
      purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate) : new Date(),
      expirationDate: new Date(formData.expirationDate)
    };

    try {
      if (item) {
        await updateItem(item.id, data);
        Alert.alert('Success', 'Item updated');
      } else {
        await addItem(data);
        Alert.alert('Success', 'Item added');
      }
      onClose();
    } catch (error) {
      console.error("Add/Update error:", error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <ScrollView contentContainerStyle={styles.modalContent}>
          <Text style={styles.title}>{item ? 'Edit Item' : 'Add New Item'}</Text>
          
          <Text style={styles.label}>Name *</Text>
          <TextInput style={styles.input} value={formData.name} onChangeText={(text) => setFormData({...formData, name: text})} placeholder="e.g., Milk" />
          
          <Text style={styles.label}>Quantity *</Text>
          <TextInput style={styles.input} value={formData.quantity} onChangeText={(text) => setFormData({...formData, quantity: text})} keyboardType="numeric" placeholder="1" />
          
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {categories.map(cat => (
              <TouchableOpacity key={cat} style={[styles.categoryChip, formData.category === cat && styles.categoryChipActive]} onPress={() => setFormData({...formData, category: cat})}>
                <Text style={formData.category === cat ? styles.categoryTextActive : styles.categoryText}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <Text style={styles.label}>Expiration Date * (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={formData.expirationDate} onChangeText={(text) => setFormData({...formData, expirationDate: text})} placeholder="2025-12-31" />
          
          <Text style={styles.label}>Purchase Date (optional)</Text>
          <TextInput style={styles.input} value={formData.purchaseDate} onChangeText={(text) => setFormData({...formData, purchaseDate: text})} placeholder="2025-01-01" />
          
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}><Text style={styles.buttonText}>Cancel</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={handleSubmit}><Text style={styles.buttonText}>{item ? 'Update' : 'Add'}</Text></TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontWeight: 'bold', marginTop: 10, marginBottom: 5 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10 },
  categoryRow: { flexDirection: 'row', marginBottom: 10 },
  categoryChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f0f0f0', marginRight: 10 },
  categoryChipActive: { backgroundColor: '#4CAF50' },
  categoryText: { color: '#333' },
  categoryTextActive: { color: '#fff' },
  buttonRow: { flexDirection: 'row', marginTop: 20, justifyContent: 'space-between' },
  button: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  submitButton: { backgroundColor: '#4CAF50' },
  cancelButton: { backgroundColor: '#f44336' },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});