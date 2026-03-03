#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "TP-Link_C366";
const char* password = "d05240803";
const char* serverName = "http://192.168.1.101:3000/get-color"; 

const int pinR = 25; const int pinG = 26; const int pinB = 27;

// Variables para suavizado (Fading)
int currentR = 0, currentG = 0, currentB = 0;
int targetR = 0, targetG = 0, targetB = 0;

void setup() {
  Serial.begin(115200);
  
  // Configuración de PWM estable
  ledcAttach(pinR, 1000, 8); 
  ledcAttach(pinG, 1000, 8); 
  ledcAttach(pinB, 1000, 8);

  WiFi.begin(ssid, password);                                     
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\n✅ Conectado");
}

void loop() {
  static unsigned long lastCheck = 0;
  unsigned long now = millis();

  // 1. Consultar al servidor solo cada 300ms (sin bloquear el loop)
  if (now - lastCheck >= 300) {
    lastCheck = now;
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.setConnectTimeout(1000); // Timeout corto para evitar colgarse
      http.begin(serverName);
      int httpCode = http.GET(); 

      if (httpCode == 200) {
        StaticJsonDocument<128> doc;
        deserializeJson(doc, http.getString());
        targetR = doc["r"];
        targetG = doc["g"];
        targetB = doc["b"];
      }
      http.end();
    }
  }

  // 2. SUAVIZADO (Fading): Esto elimina el parpadeo visual al cambiar de color
  // En lugar de saltar de golpe, se acerca al color destino poco a poco
  if (currentR != targetR) currentR += (targetR > currentR) ? 1 : -1;
  if (currentG != targetG) currentG += (targetG > currentG) ? 1 : -1;
  if (currentB != targetB) currentB += (targetB > currentB) ? 1 : -1;

  ledcWrite(pinR, currentR);
  ledcWrite(pinG, currentG);
  ledcWrite(pinB, currentB);

  delay(5); // Pequeñísima pausa para la velocidad del suavizado
}