import React, { useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import ColorPicker, { Panel1, HueSlider, Preview } from 'reanimated-color-picker';
import { Stack } from 'expo-router';
import axios from 'axios';
import { runOnJS } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function ColorScreen() {
  const [rgb, setRgb] = useState({ r: 255, g: 0, b: 0 });
  const [colorHex, setColorHex] = useState('#FF0000');

  const API_URL = "http://192.168.1.101:3000/set-color";

  const actualizarInterfaz = (hex: string) => {
    if (!hex) return;
    
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);

    if (!isNaN(r)) {
      setRgb({ r, g, b });
      setColorHex(hex);
    }
  };

  const alCambiar = (event: { hex: string }) => {
    'worklet';
    if (event && event.hex) {
      runOnJS(actualizarInterfaz)(event.hex);
    }
  };

  const enviarAlESP32 = async (r: number, g: number, b: number) => {
    try {
      await axios.post(API_URL, { r, g, b });
      console.log("✅ Enviado:", { r, g, b });
    } catch (error: any) {
      console.log("❌ Error:", error.message);
    }
  };

  const alTerminar = (event: { hex: string }) => {
    'worklet';
    if (event && event.hex) {
      const r = parseInt(event.hex.substring(1, 3), 16);
      const g = parseInt(event.hex.substring(3, 5), 16);
      const b = parseInt(event.hex.substring(5, 7), 16);
      
      runOnJS(actualizarInterfaz)(event.hex);
      runOnJS(enviarAlESP32)(r, g, b);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>Smart Lighting</Text>
        <Text style={styles.subtitle}>Control de color estable</Text>
      </View>

      <ColorPicker 
        value={colorHex} 
        onChange={alCambiar}
        onComplete={alTerminar}
        style={{ width: width * 0.85 }}
      >
        <Panel1 style={styles.panel} />
        <HueSlider style={styles.slider} />
        <Preview style={styles.preview} hideText />
      </ColorPicker>

      <View style={styles.footer}>
        <View style={styles.card}>
          <Text style={styles.rgbText}>
            R <Text style={styles.bold}>{rgb.r}</Text>  
            G <Text style={styles.bold}>{rgb.g}</Text>  
            B <Text style={styles.bold}>{rgb.b}</Text>
          </Text>
        </View>
        <Text style={styles.infoText}>Suelta para aplicar cambios</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'space-around', paddingVertical: 40 },
  header: { alignItems: 'center' },
  title: { color: '#FFF', fontSize: 32, fontWeight: 'bold' },
  subtitle: { color: '#444', fontSize: 14, marginTop: 5 },
  panel: { height: 300, borderRadius: 30, borderWidth: 2, borderColor: '#222' },
  slider: { height: 35, marginTop: 30, borderRadius: 15 },
  preview: { height: 50, marginTop: 30, borderRadius: 15 },
  footer: { alignItems: 'center' },
  card: { backgroundColor: '#111', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 20 },
  rgbText: { color: '#888', fontSize: 18, fontFamily: 'monospace' },
  bold: { color: '#FFF', fontWeight: 'bold' },
  infoText: { color: '#333', marginTop: 15, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 }
});