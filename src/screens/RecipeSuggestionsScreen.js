import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, ScrollView, StyleSheet } from 'react-native';
import { usePantry } from '../contexts/PantryContext';
import { getRecipeSuggestions } from '../utils/helpers';

// Sample recipe database – you can expand later
const RECIPES = [
  { name: 'Vegetable Stir Fry', ingredients: ['carrots', 'broccoli', 'bell peppers', 'onion', 'soy sauce'], instructions: 'Chop veg, stir fry with soy sauce.' },
  { name: 'Greek Salad', ingredients: ['cucumber', 'tomato', 'red onion', 'feta cheese', 'olives'], instructions: 'Chop and toss with olive oil.' },
  { name: 'Pasta with Tomato Sauce', ingredients: ['pasta', 'tomato', 'garlic', 'onion', 'basil'], instructions: 'Cook pasta, sauté garlic, add tomatoes, simmer.' },
  { name: 'Omelette', ingredients: ['eggs', 'milk', 'cheese', 'bell peppers', 'onion'], instructions: 'Whisk eggs, pour into pan, add fillings, fold.' },
  { name: 'Fruit Smoothie', ingredients: ['banana', 'milk', 'yogurt', 'honey'], instructions: 'Blend all until smooth.' },
  { name: 'Chicken Rice Bowl', ingredients: ['chicken', 'rice', 'bell peppers', 'onion', 'soy sauce'], instructions: 'Cook rice, stir fry chicken and veg, serve over rice.' }
];

export default function RecipeSuggestionsScreen() {
  const { items } = usePantry();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    if (items.length === 0) {
      setSuggestions([]);
      return;
    }
    const recs = getRecipeSuggestions(items, RECIPES);
    setSuggestions(recs);
  }, [items]);

  const getMatchPercent = (matched, total) => Math.round((matched / total) * 100);

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.recipeCard} onPress={() => setSelectedRecipe(item)}>
      <View style={styles.recipeHeader}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <View style={styles.matchBadge}><Text style={styles.matchText}>{getMatchPercent(item.matchedCount, item.total)}%</Text></View>
      </View>
      <Text style={styles.recipeInfo}>{item.matchedCount}/{item.total} ingredients available</Text>
      {item.usesExpiring && <Text style={styles.expiringTag}>⚠️ Uses soon-to-expire items</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={suggestions}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Add items to get recipe ideas!</Text>}
        contentContainerStyle={styles.list}
      />
      <Modal visible={selectedRecipe !== null} animationType="slide" transparent onRequestClose={() => setSelectedRecipe(null)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedRecipe?.name}</Text>
            <Text style={styles.modalSubtitle}>Ingredients:</Text>
            {selectedRecipe?.ingredients.map((ing, idx) => (
              <View key={idx} style={styles.ingredientRow}>
                <Text>• {ing}</Text>
                <Text style={{ color: selectedRecipe?.matchedIngredients.includes(ing) ? '#4CAF50' : '#f44336' }}>
                  {selectedRecipe?.matchedIngredients.includes(ing) ? '✓ Have' : '✗ Missing'}
                </Text>
              </View>
            ))}
            <Text style={styles.modalSubtitle}>Instructions:</Text>
            <Text style={styles.instructions}>{selectedRecipe?.instructions}</Text>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedRecipe(null)}><Text style={styles.closeBtnText}>Close</Text></TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  list: { padding: 16 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 12, elevation: 2 },
  recipeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recipeName: { fontSize: 18, fontWeight: 'bold' },
  matchBadge: { backgroundColor: '#4CAF50', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  matchText: { color: '#fff', fontWeight: 'bold' },
  recipeInfo: { fontSize: 14, color: '#666', marginBottom: 6 },
  expiringTag: { fontSize: 12, color: '#ff9800', fontWeight: 'bold', marginTop: 4 },
  empty: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#999' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  modalSubtitle: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  ingredientRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  instructions: { fontSize: 14, lineHeight: 20, color: '#333' },
  closeBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  closeBtnText: { color: '#fff', fontWeight: 'bold' }
});