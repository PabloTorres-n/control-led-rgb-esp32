const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Objeto para guardar el estado actual del LED
let estadoLED = { r: 0, g: 0, b: 0, nuevo: false };

// 1. Ruta que usa la APP para actualizar el color
app.post('/set-color', (req, res) => {
    const { r, g, b } = req.body;
    estadoLED = { r, g, b, nuevo: true }; // Marcamos que hay un cambio
    console.log(`🎨 Nuevo color guardado: R:${r} G:${g} B:${b}`);
    res.json({ status: "Recibido" });
});

// 2. Ruta que usa el ESP32 para "preguntar" por el color
app.get('/get-color', (req, res) => {
    // Enviamos el color actual al ESP32
    res.json({ r: estadoLED.r, g: estadoLED.g, b: estadoLED.b });
    estadoLED.nuevo = false; // Resetear bandera si quisieras optimizar
});

app.listen(3000, '0.0.0.0', () => {
    console.log("🚀 Servidor en modo POLLING corriendo en puerto 3000");
});