import React, { createContext, useState, useContext, useEffect } from 'react';
import { db } from '../firebase';
import { useAuth } from './AuthContext';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc
} from 'firebase/firestore';

const PantryContext = createContext({});

export const usePantry = () => useContext(PantryContext);

export const PantryProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Simple query without orderBy – no index needed
    const q = query(
      collection(db, 'pantryItems'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const itemsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        // Sort client-side by createdAt (newest first)
        itemsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error("Snapshot error (ignoring):", error);
        // Still set loading false and keep items empty
        setItems([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const addItem = async (itemData) => {
    if (!user) throw new Error('User not authenticated');
    try {
      const docRef = await addDoc(collection(db, 'pantryItems'), {
        ...itemData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Item added with ID:", docRef.id);
      return docRef;
    } catch (error) {
      console.error("Add item error:", error);
      throw error;
    }
  };

  const updateItem = async (id, itemData) => {
    const itemRef = doc(db, 'pantryItems', id);
    await updateDoc(itemRef, {
      ...itemData,
      updatedAt: new Date()
    });
  };

  const deleteItem = async (id) => {
    if (!user) throw new Error('Not authenticated');
    try {
        const itemRef = doc(db, 'pantryItems', id);
        await deleteDoc(itemRef);
        console.log("Deleted item:", id);
    } catch (error) {
        console.error("Delete error:", error);
        throw error;
    }
   };

  return (
    <PantryContext.Provider value={{ items, loading, addItem, updateItem, deleteItem }}>
      {children}
    </PantryContext.Provider>
  );
};