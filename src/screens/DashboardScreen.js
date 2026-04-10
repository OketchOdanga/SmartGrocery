import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usePantry } from '../contexts/PantryContext';
import { useAuth } from '../contexts/AuthContext';
import { isExpired, isExpiringSoon, isLowStock } from '../utils/helpers';

export default function DashboardScreen() {
  const { items } = usePantry();
  const { logout } = useAuth();
  const [stats, setStats] = useState({ total: 0, expired: 0, lowStock: 0, expiringSoon: 0 });
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    if (!items.length) {
      setStats({ total: 0, expired: 0, lowStock: 0, expiringSoon: 0 });
      setAlerts([]);
      return;
    }

    const expiredCount = items.filter(i => isExpired(i.expirationDate)).length;
    const lowStockCount = items.filter(i => isLowStock(i.quantity)).length;
    const expiringCount = items.filter(i => isExpiringSoon(i.expirationDate)).length;

    setStats({
      total: items.length,
      expired: expiredCount,
      lowStock: lowStockCount,
      expiringSoon: expiringCount,
    });

    const newAlerts = [];
    items.forEach(item => {
      if (isExpired(item.expirationDate)) {
        newAlerts.push({ id: item.id, message: `${item.name} has expired!`, type: 'error' });
      } else if (isExpiringSoon(item.expirationDate)) {
        const days = Math.ceil((new Date(item.expirationDate) - new Date()) / (1000*60*60*24));
        newAlerts.push({ id: item.id, message: `${item.name} expires in ${days} days`, type: 'warning' });
      }
      if (isLowStock(item.quantity)) {
        newAlerts.push({ id: item.id, message: `${item.name} is low (${item.quantity} left)`, type: 'warning' });
      }
    });
    setAlerts(newAlerts);
  }, [items]);

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: logout }
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Pantry Dashboard</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}><Text style={styles.statNum}>{stats.total}</Text><Text style={styles.statLabel}>Total Items</Text></View>
        <View style={[styles.statCard, { backgroundColor: '#ffebee' }]}><Text style={[styles.statNum, { color: '#f44336' }]}>{stats.expired}</Text><Text style={styles.statLabel}>Expired</Text></View>
        <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}><Text style={[styles.statNum, { color: '#ff9800' }]}>{stats.lowStock}</Text><Text style={styles.statLabel}>Low Stock</Text></View>
        <View style={[styles.statCard, { backgroundColor: '#fff3e0' }]}><Text style={[styles.statNum, { color: '#ff9800' }]}>{stats.expiringSoon}</Text><Text style={styles.statLabel}>Expiring Soon</Text></View>
      </View>

      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>Alerts</Text>
        {alerts.length === 0 ? (
          <Text style={styles.noAlerts}>✅ No alerts – your pantry is healthy!</Text>
        ) : (
          alerts.map(alert => (
            <View key={alert.id} style={[styles.alertCard, alert.type === 'error' ? styles.errorAlert : styles.warningAlert]}>
              <Text style={styles.alertText}>{alert.message}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 50, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  logoutBtn: { padding: 8, backgroundColor: '#f44336', borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: 'bold' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 16 },
  statCard: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, alignItems: 'center', elevation: 2 },
  statNum: { fontSize: 32, fontWeight: 'bold', color: '#4CAF50' },
  statLabel: { fontSize: 14, color: '#666', marginTop: 4 },
  alertsSection: { padding: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  alertCard: { padding: 12, borderRadius: 8, marginBottom: 8 },
  errorAlert: { backgroundColor: '#ffebee', borderLeftWidth: 4, borderLeftColor: '#f44336' },
  warningAlert: { backgroundColor: '#fff3e0', borderLeftWidth: 4, borderLeftColor: '#ff9800' },
  alertText: { fontSize: 14, color: '#333' },
  noAlerts: { fontSize: 16, color: '#4CAF50', textAlign: 'center', marginTop: 20 }
});