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
  doc,
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

    setLoading(true);

    const q = query(
      collection(db, 'pantryItems'),
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const itemsData = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        itemsData.sort((a, b) => {
          const dateA = a.createdAt?.toDate
            ? a.createdAt.toDate()
            : a.createdAt
              ? new Date(a.createdAt)
              : new Date(0);

          const dateB = b.createdAt?.toDate
            ? b.createdAt.toDate()
            : b.createdAt
              ? new Date(b.createdAt)
              : new Date(0);

          return dateB - dateA;
        });

        setItems(itemsData);
        setLoading(false);
      },
      (error) => {
        console.error('Snapshot error:', error);
        setItems([]);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  const addItem = async (itemData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const docRef = await addDoc(collection(db, 'pantryItems'), {
        ...itemData,
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log('Item added with ID:', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Add item error:', error);
      throw error;
    }
  };

  const updateItem = async (id, itemData) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const itemRef = doc(db, 'pantryItems', id);

      await updateDoc(itemRef, {
        ...itemData,
        updatedAt: new Date(),
      });

      console.log('Updated item:', id);
    } catch (error) {
      console.error('Update item error:', error);
      throw error;
    }
  };

  const deleteItem = async (id) => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      const itemRef = doc(db, 'pantryItems', id);
      await deleteDoc(itemRef);
      console.log('Deleted item:', id);
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  return (
    <PantryContext.Provider
      value={{
        items,
        loading,
        addItem,
        updateItem,
        deleteItem,
      }}
    >
      {children}
    </PantryContext.Provider>
  );
};