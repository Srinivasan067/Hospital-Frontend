import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '../store/useStore';

export default function UploadPrescriptionScreen() {
  const [uploaded, setUploaded] = useState(false);
  const navigation = useNavigation();
  const simulateDoctorApproval = useStore(state => state.simulateDoctorApproval);
  const addNotification = useStore(state => state.addNotification);
  const uploadPrescription = useStore(state => state.uploadPrescription);

  const handleUpload = () => {
    setUploaded(true);
  };

  const handleSubmit = () => {
    uploadPrescription('prescription_123.jpg');
    simulateDoctorApproval();
    addNotification({
      title: 'Prescription Uploaded',
      message: 'Your prescription has been uploaded and is pending doctor approval.'
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Prescription</Text>
      <Text style={styles.subtitle}>Upload a clear image of your prescription for doctor approval before ordering.</Text>
      
      {!uploaded ? (
        <TouchableOpacity style={styles.uploadArea} onPress={handleUpload}>
          <View style={styles.uploadIconContainer}>
            <MaterialCommunityIcons name="cloud-upload-outline" size={40} color={theme.colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Tap to Upload</Text>
          <Text style={styles.uploadSub}>Supports JPG, PNG (Max 5MB)</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.previewContainer}>
          <View style={styles.imagePlaceholder}>
            <MaterialCommunityIcons name="file-document-outline" size={60} color="#A0AEC0" />
            <Text style={styles.fileName}>prescription_123.jpg</Text>
          </View>
          <TouchableOpacity onPress={() => setUploaded(false)} style={styles.removeBtn}>
            <MaterialCommunityIcons name="close-circle" size={24} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.timeline}>
        <Text style={styles.timelineTitle}>Approval Workflow</Text>
        <View style={styles.step}>
          <MaterialCommunityIcons name="check-circle" size={20} color={uploaded ? theme.colors.success : '#CBD5E0'} />
          <Text style={[styles.stepText, uploaded && { color: theme.colors.text }]}>1. Upload Prescription</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.step}>
          <MaterialCommunityIcons name="circle-outline" size={20} color="#CBD5E0" />
          <Text style={styles.stepText}>2. Under Doctor Review</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={styles.step}>
          <MaterialCommunityIcons name="circle-outline" size={20} color="#CBD5E0" />
          <Text style={styles.stepText}>3. Approved / Rejected</Text>
        </View>
      </View>

      <Button 
        mode="contained" 
        onPress={handleSubmit} 
        disabled={!uploaded}
        style={styles.submitBtn}
        contentStyle={{ height: 55 }}
      >
        Submit for Approval
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 10 },
  subtitle: { fontSize: 15, color: '#4A5568', marginBottom: 30, lineHeight: 22 },
  uploadArea: { borderWidth: 2, borderColor: '#E2E8F0', borderStyle: 'dashed', borderRadius: 20, padding: 40, alignItems: 'center', backgroundColor: '#F7FAFC' },
  uploadIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  uploadTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary, marginBottom: 5 },
  uploadSub: { fontSize: 13, color: '#718096' },
  previewContainer: { backgroundColor: theme.colors.surface, borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', position: 'relative' },
  imagePlaceholder: { width: '100%', height: 150, backgroundColor: '#F7FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  fileName: { marginTop: 10, color: theme.colors.text, fontWeight: '600' },
  removeBtn: { position: 'absolute', top: 10, right: 10 },
  timeline: { marginTop: 40, backgroundColor: theme.colors.surface, padding: 20, borderRadius: 16 },
  timelineTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepText: { fontSize: 15, color: '#A0AEC0', fontWeight: '500' },
  stepLine: { width: 2, height: 20, backgroundColor: '#E2E8F0', marginLeft: 9, marginVertical: 4 },
  submitBtn: { marginTop: 'auto', borderRadius: 12, backgroundColor: theme.colors.primary }
});
