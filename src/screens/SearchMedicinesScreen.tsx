import React, { useState, useMemo } from 'react';
import {
  View, StyleSheet, FlatList, TouchableOpacity,
  Modal, ScrollView, Alert,
} from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useStore } from '../store/useStore';
import { theme } from '../theme/theme';
import { Medicine } from '../types';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type SortKey = 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'stock_desc';
type StatusFilter = 'All' | 'Approved' | 'Pending' | 'Rejected';

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'default',    label: 'Relevance',          icon: 'star-outline' },
  { key: 'price_asc',  label: 'Price: Low to High',  icon: 'sort-ascending' },
  { key: 'price_desc', label: 'Price: High to Low',  icon: 'sort-descending' },
  { key: 'name_asc',   label: 'Name: A → Z',         icon: 'alphabetical-variant' },
  { key: 'name_desc',  label: 'Name: Z → A',         icon: 'alphabetical-variant-off' },
  { key: 'stock_desc', label: 'Availability',        icon: 'package-variant' },
];

const CATEGORIES = ['All', 'Tablet', 'Capsule', 'Syrup', 'Drops'];
const STATUS_FILTERS: StatusFilter[] = ['All', 'Approved', 'Pending', 'Rejected'];

const STATUS_CONFIG = {
  Approved: { color: theme.colors.success, bg: '#C6F6D5', icon: 'check-circle' },
  Pending:  { color: theme.colors.pending, bg: '#FEFCBF', icon: 'clock' },
  Rejected: { color: theme.colors.error,   bg: '#FED7D7', icon: 'close-circle' },
};

export default function SearchMedicinesScreen() {
  const medicines = useStore(state => state.medicines);
  const cart      = useStore(state => state.cart);
  const addToCart = useStore(state => state.addToCart);

  const [query,        setQuery]        = useState('');
  const [sortKey,      setSortKey]      = useState<SortKey>('default');
  const [category,     setCategory]     = useState('All');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortModal,    setSortModal]    = useState(false);

  const results = useMemo(() => {
    let list = [...medicines];
    if (query.trim())
      list = list.filter(m =>
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.code.toLowerCase().includes(query.toLowerCase())
      );
    if (category !== 'All')     list = list.filter(m => m.category === category);
    if (statusFilter !== 'All') list = list.filter(m => m.status === statusFilter);

    switch (sortKey) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'name_asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'name_desc':  list.sort((a, b) => b.name.localeCompare(a.name)); break;
      case 'stock_desc': list.sort((a, b) => b.stock - a.stock); break;
    }
    return list;
  }, [medicines, query, sortKey, category, statusFilter]);

  const isInCart = (id: string) => cart.some(c => c.id === id);
  const currentSort = SORT_OPTIONS.find(s => s.key === sortKey)!;
  const hasActiveFilters = category !== 'All' || statusFilter !== 'All' || sortKey !== 'default';

  const handleAddToCart = (medicine: Medicine) => {
    if (medicine.status === 'Rejected') return;
    
    if (medicine.status === 'Pending') {
      Alert.alert(
        'Requires Doctor Approval',
        'Sent to your primary doctor. Wait for their approval in the cart before you can check out.',
        [{ text: 'OK' }]
      );
    }
    
    addToCart(medicine);
  };

  /* ─── header rendered inside FlatList ─── */
  const ListHeader = () => (
    <View>
      {/* Search */}
      <View style={styles.searchRow}>
        <Searchbar
          placeholder="Search medicine or code..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchbar}
          inputStyle={{ fontSize: 14 }}
        />
      </View>

      {/* Sort + Category row */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.sortBtn} onPress={() => setSortModal(true)}>
          <MaterialCommunityIcons name="sort" size={16} color={theme.colors.primary} />
          <Text style={styles.sortBtnText} numberOfLines={1}>{currentSort.label}</Text>
          <MaterialCommunityIcons name="chevron-down" size={16} color={theme.colors.primary} />
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContent}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat}
              style={[styles.chip, category === cat && styles.chipActive]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Status filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow} contentContainerStyle={styles.chipsContent}>
        {STATUS_FILTERS.map(sf => {
          const isActive = statusFilter === sf;
          const cfg = sf !== 'All' ? STATUS_CONFIG[sf as keyof typeof STATUS_CONFIG] : null;
          return (
            <TouchableOpacity
              key={sf}
              style={[
                styles.statusChip,
                isActive && { backgroundColor: cfg?.bg ?? theme.colors.primary + '22', borderColor: cfg?.color ?? theme.colors.primary },
              ]}
              onPress={() => setStatusFilter(sf)}
            >
              {cfg && (
                <MaterialCommunityIcons name={cfg.icon as any} size={12} color={isActive ? cfg.color : '#718096'} />
              )}
              <Text style={[styles.statusChipText, isActive && { color: cfg?.color ?? theme.colors.primary, fontWeight: 'bold' }]}>
                {sf}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Results bar */}
      <View style={styles.resultsBar}>
        <Text style={styles.resultsText}>{results.length} medicines found</Text>
        {hasActiveFilters && (
          <TouchableOpacity onPress={() => { setCategory('All'); setStatusFilter('All'); setSortKey('default'); setQuery(''); }}>
            <Text style={styles.clearText}>Clear all</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMedicine = ({ item }: { item: Medicine }) => {
    const cfg        = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG];
    const inCart     = isInCart(item.id);
    const isRejected = item.status === 'Rejected';
    const isPending  = item.status === 'Pending';

    return (
      <View style={[styles.card, isRejected && styles.cardRejected]}>
        <View style={[styles.accentBar, { backgroundColor: cfg?.color ?? '#CBD5E0' }]} />

        <View style={styles.cardContent}>
          {/* Top row */}
          <View style={styles.cardTop}>
            <View style={styles.iconBox}>
              <MaterialCommunityIcons
                name={item.category === 'Syrup' ? 'bottle-tonic' : item.category === 'Drops' ? 'eyedropper' : 'pill'}
                size={26}
                color={isRejected ? '#CBD5E0' : theme.colors.primary}
              />
            </View>
            <View style={styles.info}>
              <Text style={[styles.medicineName, isRejected && { color: '#A0AEC0' }]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.medicineCode}>{item.code} · {item.category}</Text>
              <Text style={styles.stock}>Stock: {item.stock} units</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: cfg?.bg ?? '#EDF2F7' }]}>
              <MaterialCommunityIcons name={(cfg?.icon ?? 'help-circle') as any} size={11} color={cfg?.color ?? '#718096'} />
              <Text style={[styles.statusText, { color: cfg?.color ?? '#718096' }]}>{item.status}</Text>
            </View>
          </View>

          {/* Banners */}
          {isPending && (
            <View style={styles.pendingBanner}>
              <MaterialCommunityIcons name="clock-alert-outline" size={14} color="#B7791F" />
              <Text style={styles.pendingMsg}>Awaiting doctor approval — cannot be added to cart until approved.</Text>
            </View>
          )}
          {isRejected && (
            <View style={styles.rejectedBanner}>
              <MaterialCommunityIcons name="close-octagon-outline" size={14} color="#C53030" />
              <Text style={styles.rejectedMsg}>Rejected by doctor — this medicine cannot be ordered.</Text>
            </View>
          )}

          {/* Footer */}
          <View style={styles.cardFooter}>
            <Text style={[styles.price, isRejected && { color: '#A0AEC0' }]}>₹{item.price}</Text>

            {isRejected ? (
              <View style={styles.rejectedBtn}>
                <MaterialCommunityIcons name="block-helper" size={13} color="#A0AEC0" />
                <Text style={styles.rejectedBtnText}>Unavailable</Text>
              </View>
            ) : isPending ? (
              <TouchableOpacity style={styles.pendingBtn} onPress={() => handleAddToCart(item)}>
                <MaterialCommunityIcons name="cart-plus" size={13} color="#B7791F" />
                <Text style={styles.pendingBtnText}>Add (Needs Approval)</Text>
              </TouchableOpacity>
            ) : inCart ? (
              <View style={styles.addedBtn}>
                <MaterialCommunityIcons name="check" size={15} color={theme.colors.success} />
                <Text style={styles.addedBtnText}>Added</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => handleAddToCart(item)}>
                <MaterialCommunityIcons name="cart-plus" size={15} color="#fff" />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={renderMedicine}
        ListHeaderComponent={ListHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <MaterialCommunityIcons name="magnify-close" size={70} color="#CBD5E0" />
            <Text style={styles.emptyText}>No medicines found</Text>
          </View>
        }
      />

      {/* Sort Bottom Sheet Modal */}
      <Modal visible={sortModal} transparent animationType="slide" onRequestClose={() => setSortModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModal(false)}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Sort By</Text>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.modalRow, sortKey === opt.key && styles.modalRowActive]}
                onPress={() => { setSortKey(opt.key); setSortModal(false); }}
              >
                <View style={styles.modalRowLeft}>
                  <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={22}
                    color={sortKey === opt.key ? theme.colors.primary : '#718096'}
                  />
                  <Text style={[styles.modalRowText, sortKey === opt.key && { color: theme.colors.primary, fontWeight: 'bold' }]}>
                    {opt.label}
                  </Text>
                </View>
                {sortKey === opt.key && (
                  <MaterialCommunityIcons name="check-circle" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },

  /* header area */
  searchRow:    { paddingHorizontal: 15, paddingTop: 12, paddingBottom: 8 },
  searchbar:    { borderRadius: 14, backgroundColor: '#fff', elevation: 2 },
  controlsRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 8, gap: 10 },
  sortBtn:      { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1.5, borderColor: theme.colors.primary, maxWidth: 160 },
  sortBtnText:  { fontSize: 11, color: theme.colors.primary, fontWeight: '600', flexShrink: 1 },
  chipsContent: { gap: 8, paddingRight: 4 },
  chip:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#EDF2F7', borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive:   { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  chipText:     { fontSize: 13, color: '#4A5568', fontWeight: '500' },
  chipTextActive:{ color: '#fff', fontWeight: 'bold' },

  statusRow:      { paddingHorizontal: 15, paddingBottom: 8 },
  statusChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F7FAFC', borderWidth: 1.5, borderColor: '#E2E8F0', marginRight: 8 },
  statusChipText: { fontSize: 12, color: '#718096' },

  resultsBar:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingBottom: 10 },
  resultsText: { fontSize: 13, color: '#718096' },
  clearText:   { fontSize: 13, color: theme.colors.primary, fontWeight: '600' },

  /* list */
  list: { paddingHorizontal: 15, paddingBottom: 30, gap: 12 },

  /* card */
  card:         { backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3 },
  cardRejected: { opacity: 0.75 },
  accentBar:    { width: 5 },
  cardContent:  { flex: 1, padding: 14 },
  cardTop:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  iconBox:      { width: 44, height: 44, borderRadius: 12, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  info:         { flex: 1 },
  medicineName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text, marginBottom: 2 },
  medicineCode: { fontSize: 12, color: '#718096', marginBottom: 2 },
  stock:        { fontSize: 11, color: '#718096' },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', flexShrink: 0 },
  statusText:   { fontSize: 10, fontWeight: 'bold' },

  pendingBanner:  { flexDirection: 'row', alignItems: 'flex-start', gap: 7, backgroundColor: '#FFFFF0', borderRadius: 10, padding: 9, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#F6AD55' },
  pendingMsg:     { flex: 1, fontSize: 11, color: '#7B341E', lineHeight: 16 },
  rejectedBanner: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, backgroundColor: '#FFF5F5', borderRadius: 10, padding: 9, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#FC8181' },
  rejectedMsg:    { flex: 1, fontSize: 11, color: '#C53030', lineHeight: 16 },

  cardFooter:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price:          { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary },
  addBtn:         { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.colors.primary, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  addBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  addedBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#C6F6D5', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 12 },
  addedBtnText:   { color: theme.colors.success, fontWeight: 'bold', fontSize: 13 },
  pendingBtn:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FEFCBF', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 12 },
  pendingBtnText: { color: '#B7791F', fontWeight: 'bold', fontSize: 11 },
  rejectedBtn:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#EDF2F7', paddingHorizontal: 11, paddingVertical: 9, borderRadius: 12 },
  rejectedBtnText:{ color: '#A0AEC0', fontWeight: 'bold', fontSize: 11 },

  emptyBox:  { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 12, fontSize: 16, color: '#A0AEC0' },

  /* sort modal */
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet:     { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 40, paddingTop: 16 },
  modalHandle:    { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0', alignSelf: 'center', marginBottom: 18 },
  modalTitle:     { fontSize: 20, fontWeight: 'bold', color: theme.colors.text, marginBottom: 18 },
  modalRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F7FAFC' },
  modalRowActive: { backgroundColor: '#EBF4FF', borderRadius: 12, paddingHorizontal: 10, marginHorizontal: -10 },
  modalRowLeft:   { flexDirection: 'row', alignItems: 'center', gap: 14 },
  modalRowText:   { fontSize: 16, color: '#4A5568' },
});
