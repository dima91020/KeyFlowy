#include <WiFi.h>
#include <WebSocketsClient.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_PN532.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

// I2C Hardware Pins for Dual Readers
#define SDA_1 21
#define SCL_1 22

#define SDA_2 17
#define SCL_2 5

// Dummy IRQ/Reset pins for PN532 I2C
#define PN532_IRQ   255
#define PN532_RESET 255

// Status Indicators & Actuators
#define BUZZER_IN_PIN   4    
#define BUZZER_OUT_PIN  32   

#define GREEN_LED_IN    14   
#define RED_LED_IN      26   
#define YELLOW_LED_IN   27   

#define GREEN_LED_OUT   25   
#define RED_LED_OUT     33   
#define YELLOW_LED_OUT  2    

#define DOOR_SENSOR_PIN 16
#define RELAY_PIN       13     

// Independent I2C Buses for Entry and Exit PN532 Readers
TwoWire I2C_Entry = TwoWire(0);
TwoWire I2C_Exit = TwoWire(1);

Adafruit_PN532 readerEntry(PN532_IRQ, PN532_RESET, &I2C_Entry); 
Adafruit_PN532 readerExit(PN532_IRQ, PN532_RESET, &I2C_Exit);  

WebSocketsClient webSocket;
WiFiManager wifiManager;

char websockets_server_host[40] = "192.168.50.221"; 
const uint16_t websockets_server_port = 8080;
const uint16_t api_server_port = 3000; 
String myMacAddress = "";

String api_domain = "my-acs-project.vercel.app"; 
bool use_https = false; 

// Root CA Certificate for HTTPS API calls
const char* rootCACertificate = \
"-----BEGIN CERTIFICATE-----\n" \
"MIIFazCCA1OgAwIBAgIRAIIQz7DSQONZRnXubJIVcwAwDQYJKoZIhvcNAQELBQAw\n" \
"-----END CERTIFICATE-----\n";

bool isConnected = false;
bool isRegistered = false; 

unsigned long lastReadTime = 0;
unsigned long cooldownDelay = 2000; 
unsigned long lastWiFiCheck = 0;

bool isRegistrationMode = false; 
unsigned long registrationStartTime = 0;
unsigned long lastRegBlinkTime = 0; 
bool blinkState = false;         

String pendingUID = "";
String pendingDirection = "";
bool waitingForPassage = false; 

bool lastDoorState = false;   
bool isDoorUnlocked = false;          
unsigned long unlockTime = 0;         
unsigned long doorOpenedTime = 0;     

unsigned long currentUnlockTimeout = 5000; 
String currentRelayType = "NO"; 

bool isAlarmActive = false; 
bool isIntrusionActive = false; 
unsigned long lastAlarmBeep = 0;
unsigned long lastIntrusionBlinkTime = 0; 

const unsigned long ALARM_TIMEOUT = 15000; 

bool isDeniedActive = false;
unsigned long deniedStartTime = 0;
bool pendingConfigFetch = false;

// Async PWM Sound Engine
unsigned long buzzerStopTime_IN = 0;
unsigned long buzzerStopTime_OUT = 0;

void startBeep(uint8_t pin, int frequency, int duration) {
    ledcAttach(pin, frequency, 8); 
    ledcWrite(pin, 5); 
    if (pin == BUZZER_IN_PIN) {
        buzzerStopTime_IN = millis() + duration;
    } else if (pin == BUZZER_OUT_PIN) {
        buzzerStopTime_OUT = millis() + duration;
    }
}

void handleBuzzer() {
    if (buzzerStopTime_IN > 0 && millis() >= buzzerStopTime_IN) {
        ledcWrite(BUZZER_IN_PIN, 0);
        ledcDetach(BUZZER_IN_PIN);
        buzzerStopTime_IN = 0;
    }
    if (buzzerStopTime_OUT > 0 && millis() >= buzzerStopTime_OUT) {
        ledcWrite(BUZZER_OUT_PIN, 0);
        ledcDetach(BUZZER_OUT_PIN);
        buzzerStopTime_OUT = 0;
    }
}

void ledsOff() {
    digitalWrite(GREEN_LED_IN, LOW);
    digitalWrite(RED_LED_IN, LOW);
    digitalWrite(YELLOW_LED_IN, LOW);
    
    digitalWrite(GREEN_LED_OUT, LOW);
    digitalWrite(RED_LED_OUT, LOW);
    digitalWrite(YELLOW_LED_OUT, LOW);
}

void lockDoor() {
    if (currentRelayType == "NC") {
        digitalWrite(RELAY_PIN, LOW); 
    } else {
        digitalWrite(RELAY_PIN, HIGH); 
    }
    
    isDoorUnlocked = false;
    ledsOff();
    Serial.println("Door Locked (" + currentRelayType + ")");
}

void fetchConfiguration() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Error: WiFi not connected.");
        return;
    }

    HTTPClient http;
    http.setTimeout(5000); 
    
    String cacheBuster = "&t=" + String(millis());
    String serverPath;
    
    WiFiClient client;
    WiFiClientSecure secureClient;

    String newRelayType = currentRelayType; 

    if (use_https) {
        secureClient.setCACert(rootCACertificate); 
        serverPath = "https://" + api_domain + "/api/hardware/config?mac=" + myMacAddress + cacheBuster;
        Serial.println("Fetching config HTTPS: " + serverPath);
        http.begin(secureClient, serverPath);
    } else {
        serverPath = "http://" + String(websockets_server_host) + ":" + String(api_server_port) + "/api/hardware/config?mac=" + myMacAddress + cacheBuster;
        Serial.println("Fetching config HTTP: " + serverPath);
        http.begin(client, serverPath);
    }
    
    int httpResponseCode = http.GET();
    
    if (httpResponseCode == HTTP_CODE_OK) {
        String payload = http.getString();
        
        if (payload.length() == 0) {
            http.end();
            return;
        }
        
        JsonDocument doc; 
        DeserializationError error = deserializeJson(doc, payload);
        
        if (!error) {
            if (doc.containsKey("relayTime")) {
                currentUnlockTimeout = doc["relayTime"].as<unsigned long>() * 1000;
            }
            if (doc.containsKey("relayType")) {
                newRelayType = doc["relayType"].as<String>();
                newRelayType.trim();
                newRelayType.toUpperCase();
            }
            
            bool typeChanged = (newRelayType != currentRelayType);
            currentRelayType = newRelayType; 

            if (!isDoorUnlocked || typeChanged) {
                lockDoor();
            }
        }
    }
    http.end();
}

void accessGranted(unsigned long relayDuration, String rType) {
    if (pendingDirection == "ENTRY") {
        digitalWrite(YELLOW_LED_IN, LOW); 
        digitalWrite(GREEN_LED_IN, HIGH);
    } else {
        digitalWrite(YELLOW_LED_OUT, LOW); 
        digitalWrite(GREEN_LED_OUT, HIGH);
    }
    
    rType.trim();
    rType.toUpperCase();
    currentRelayType = rType; 
    
    if (currentRelayType == "NC") {
        digitalWrite(RELAY_PIN, HIGH); 
    } else {
        digitalWrite(RELAY_PIN, LOW);  
    }
    
    isDoorUnlocked = true;
    unlockTime = millis(); 
    currentUnlockTimeout = relayDuration; 
    waitingForPassage = true; 
    
    uint8_t activeBuzzer = (pendingDirection == "ENTRY") ? BUZZER_IN_PIN : BUZZER_OUT_PIN;
    startBeep(activeBuzzer, 2000, 250); 
}

void accessDenied() {
    if (pendingDirection == "ENTRY") {
        digitalWrite(YELLOW_LED_IN, LOW);
        digitalWrite(RED_LED_IN, HIGH);
    } else {
        digitalWrite(YELLOW_LED_OUT, LOW);
        digitalWrite(RED_LED_OUT, HIGH);
    }
    
    uint8_t activeBuzzer = (pendingDirection == "ENTRY") ? BUZZER_IN_PIN : BUZZER_OUT_PIN;
    startBeep(activeBuzzer, 300, 800); 
    
    isDeniedActive = true;
    deniedStartTime = millis();
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            isConnected = false;
            isRegistered = false; 
            ledsOff();
            digitalWrite(RED_LED_IN, HIGH);
            digitalWrite(RED_LED_OUT, HIGH);
            break;
            
        case WStype_CONNECTED:
            isConnected = true;
            isRegistered = false; 
            ledsOff(); 
            digitalWrite(YELLOW_LED_IN, HIGH);
            digitalWrite(YELLOW_LED_OUT, HIGH);
            {
                JsonDocument doc;
                doc["type"] = "REGISTER";
                doc["mac"] = myMacAddress;
                String out; serializeJson(doc, out);
                webSocket.sendTXT(out);
            }
            break;
            
        case WStype_TEXT: {
            if (length > 1024) return;

            JsonDocument doc; 
            DeserializationError error = deserializeJson(doc, payload);
            if (error) return; 
            
            String msgType = doc["type"].as<String>();
            
            if (msgType == "ACCESS_RESPONSE") {
                String status = doc["status"].as<String>();
                if (status == "GRANTED") {
                    unsigned long rTime = doc.containsKey("relayTime") ? doc["relayTime"].as<unsigned long>() * 1000 : 5000;
                    String rType = doc.containsKey("relayType") ? doc["relayType"].as<String>() : "NO";
                    accessGranted(rTime, rType);
                } else if (status == "DENIED") {
                    accessDenied();
                }
            }
            else if (msgType == "SYSTEM") {
                String cmd = doc["command"].as<String>();
                if (cmd == "REGISTER_OK") {
                    isRegistered = true;
                    ledsOff();
                    startBeep(BUZZER_IN_PIN, 1000, 100);
                } else if (cmd == "UNAUTHORIZED") {
                    isRegistered = false;
                    ledsOff();
                    digitalWrite(RED_LED_IN, HIGH);
                    digitalWrite(RED_LED_OUT, HIGH);
                    startBeep(BUZZER_IN_PIN, 300, 1000); 
                }
            }
            else if (msgType == "COMMAND") {
                String cmd = doc["command"].as<String>();
                if (cmd == "UNLOCK") {
                    unsigned long rTime = doc.containsKey("relayTime") ? doc["relayTime"].as<unsigned long>() * 1000 : 5000;
                    String rType = doc.containsKey("relayType") ? doc["relayType"].as<String>() : "NO";
                    pendingDirection = "ENTRY"; 
                    pendingUID = "REMOTE"; 
                    accessGranted(rTime, rType); 
                } else if (cmd == "UPDATE_CONFIG") {
                    if (!doc.containsKey("relayType") && !doc.containsKey("relayTime")) {
                        pendingConfigFetch = true;
                    } else {
                        String newRelayType = currentRelayType;
                        if (doc.containsKey("relayTime")) {
                            currentUnlockTimeout = doc["relayTime"].as<unsigned long>() * 1000;
                        }
                        if (doc.containsKey("relayType")) {
                            newRelayType = doc["relayType"].as<String>();
                            newRelayType.trim();
                            newRelayType.toUpperCase();
                        }
                        bool typeChanged = (newRelayType != currentRelayType);
                        currentRelayType = newRelayType;
                        if (!isDoorUnlocked || typeChanged) {
                            lockDoor();
                        }
                    }
                } else if (cmd == "START_SCAN") {
                    ledsOff();
                    isRegistrationMode = true;
                    registrationStartTime = millis();
                    lastRegBlinkTime = millis();
                    blinkState = true;
                    digitalWrite(YELLOW_LED_IN, HIGH);
                    digitalWrite(YELLOW_LED_OUT, HIGH);
                    startBeep(BUZZER_IN_PIN, 3000, 200); 
                } else if (cmd == "CANCEL_SCAN") {
                    if (isRegistrationMode) {
                        isRegistrationMode = false;
                        ledsOff(); 
                        startBeep(BUZZER_IN_PIN, 500, 200); 
                    }
                } else if (cmd == "RESET_WIFI") {
                    startBeep(BUZZER_IN_PIN, 1000, 1000); 
                    wifiManager.resetSettings(); 
                    delay(1000); 
                    ESP.restart(); 
                }
            }
            break;
        }
    }
}

void setup() {
    Serial.begin(115200);

    pinMode(BUZZER_IN_PIN, OUTPUT);
    pinMode(BUZZER_OUT_PIN, OUTPUT);
    
    pinMode(GREEN_LED_IN, OUTPUT);
    pinMode(RED_LED_IN, OUTPUT);
    pinMode(YELLOW_LED_IN, OUTPUT);
    
    pinMode(GREEN_LED_OUT, OUTPUT);
    pinMode(RED_LED_OUT, OUTPUT);
    pinMode(YELLOW_LED_OUT, OUTPUT);
    
    digitalWrite(RELAY_PIN, HIGH); 
    pinMode(RELAY_PIN, OUTPUT);
    
    pinMode(DOOR_SENSOR_PIN, INPUT_PULLUP);
    lastDoorState = digitalRead(DOOR_SENSOR_PIN);
    
    ledsOff();

    I2C_Entry.begin(SDA_1, SCL_1);
    I2C_Exit.begin(SDA_2, SCL_2);

    readerEntry.begin();
    readerExit.begin();
    
    uint32_t versiondata1 = readerEntry.getFirmwareVersion();
    if (versiondata1) {
        readerEntry.SAMConfig();
    }

    uint32_t versiondata2 = readerExit.getFirmwareVersion();
    if (versiondata2) {
        readerExit.SAMConfig();
    }

    WiFiManagerParameter custom_ws_server("server", "WS Server IP", websockets_server_host, 40);
    wifiManager.addParameter(&custom_ws_server);

    if (!wifiManager.autoConnect("SecurePass-Setup")) ESP.restart();

    myMacAddress = WiFi.macAddress();
    strcpy(websockets_server_host, custom_ws_server.getValue());
    
    fetchConfiguration();
    
    webSocket.begin(websockets_server_host, websockets_server_port, "/");
    webSocket.onEvent(webSocketEvent);
    webSocket.setReconnectInterval(5000);
}

void loop() {
    if (WiFi.status() != WL_CONNECTED) {
        if (millis() - lastWiFiCheck >= 10000) {
            Serial.println("WiFi connection lost. Reconnecting...");
            WiFi.disconnect();
            WiFi.reconnect();
            lastWiFiCheck = millis();
        }
    }

    webSocket.loop();
    handleBuzzer();

    if (pendingConfigFetch) {
        pendingConfigFetch = false;
        fetchConfiguration();
    }

    if (isDeniedActive && (millis() - deniedStartTime > 1000)) {
        isDeniedActive = false;
        ledsOff();
    }

    if (isRegistrationMode) {
        if (millis() - lastRegBlinkTime > 300) { 
            blinkState = !blinkState;
            digitalWrite(YELLOW_LED_IN, blinkState ? HIGH : LOW);
            digitalWrite(YELLOW_LED_OUT, blinkState ? HIGH : LOW);
            lastRegBlinkTime = millis();
        }
    }

    if (isIntrusionActive) {
        if (millis() - lastIntrusionBlinkTime > 150) { 
            blinkState = !blinkState;
            digitalWrite(GREEN_LED_IN, blinkState ? HIGH : LOW);
            digitalWrite(RED_LED_IN, blinkState ? HIGH : LOW);
            digitalWrite(YELLOW_LED_IN, blinkState ? HIGH : LOW);
            digitalWrite(GREEN_LED_OUT, blinkState ? HIGH : LOW);
            digitalWrite(RED_LED_OUT, blinkState ? HIGH : LOW);
            digitalWrite(YELLOW_LED_OUT, blinkState ? HIGH : LOW);
            lastIntrusionBlinkTime = millis();
        }
        
        if (millis() - lastAlarmBeep > 300) {
            startBeep(BUZZER_IN_PIN, blinkState ? 2500 : 1000, 150); 
            startBeep(BUZZER_OUT_PIN, blinkState ? 2500 : 1000, 150);
            lastAlarmBeep = millis();
        }
    }

    bool currentDoorState = digitalRead(DOOR_SENSOR_PIN);
    if (currentDoorState != lastDoorState) {
        delay(50); 
        if (digitalRead(DOOR_SENSOR_PIN) == currentDoorState) {
            lastDoorState = currentDoorState;
            String stateStr = (currentDoorState == HIGH) ? "OPENED" : "CLOSED";
            
            if (isRegistered) {
                JsonDocument doorDoc;
                doorDoc["type"] = "DOOR_EVENT";
                doorDoc["mac"] = myMacAddress;
                doorDoc["payload"] = stateStr;
                String dOut; serializeJson(doorDoc, dOut);
                webSocket.sendTXT(dOut);
            }

            if (currentDoorState == HIGH) {
                doorOpenedTime = millis();
                
                if (waitingForPassage && isRegistered) {
                    JsonDocument passDoc;
                    passDoc["type"] = "PASSAGE_CONFIRMED";
                    passDoc["mac"] = myMacAddress;
                    passDoc["payload"] = "UID:" + pendingUID;
                    passDoc["direction"] = pendingDirection;
                    String pOut; serializeJson(passDoc, pOut);
                    webSocket.sendTXT(pOut);
                    
                    waitingForPassage = false; 
                    pendingUID = ""; 
                } 
                else if (!isDoorUnlocked && isRegistered) {
                    isIntrusionActive = true;
                    
                    JsonDocument alertDoc;
                    alertDoc["type"] = "INTRUSION_ALERT";
                    alertDoc["mac"] = myMacAddress;
                    String aOut; serializeJson(alertDoc, aOut);
                    webSocket.sendTXT(aOut);
                }
            } else {
                if (isDoorUnlocked) {
                    lockDoor(); 
                }
                isAlarmActive = false; 
                
                if (isIntrusionActive) {
                    isIntrusionActive = false;
                    ledsOff();
                }
            }
        }
    }

    if (isDoorUnlocked && currentDoorState == LOW && (millis() - unlockTime > currentUnlockTimeout)) {
        lockDoor();
        waitingForPassage = false; 
        pendingUID = ""; 
    }

    if (currentDoorState == HIGH && !isIntrusionActive && (millis() - doorOpenedTime > ALARM_TIMEOUT)) {
        isAlarmActive = true;
    }
    
    if (isAlarmActive && !isIntrusionActive) {
        if (millis() - lastAlarmBeep > 500) {
            startBeep(BUZZER_IN_PIN, 1500, 200); 
            lastAlarmBeep = millis();
        }
    }

    if (isRegistrationMode && (millis() - registrationStartTime > 15000)) {
        isRegistrationMode = false;
        ledsOff(); 
        startBeep(BUZZER_IN_PIN, 500, 300); 
    }

    if (!isConnected || !isRegistered) return;
    if (millis() - lastReadTime < cooldownDelay) return; 

    uint8_t uid[] = { 0, 0, 0, 0, 0, 0, 0 };  
    uint8_t uidLength;                        
    Adafruit_PN532* activeReader = nullptr;

    if (readerEntry.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, 20)) {
        activeReader = &readerEntry;
        pendingDirection = "ENTRY";
    } 
    else if (readerExit.readPassiveTargetID(PN532_MIFARE_ISO14443A, uid, &uidLength, 20)) {
        activeReader = &readerExit;
        pendingDirection = "EXIT";
    }

    if (activeReader != nullptr) {
        String content = "";
        for (uint8_t i = 0; i < uidLength; i++) {
            content.concat(String(uid[i] < 0x10 ? "0" : ""));
            content.concat(String(uid[i], HEX));
            if (i < uidLength - 1) content.concat("-");
        }
        content.toUpperCase();
        
        if (isRegistrationMode) {
            JsonDocument eventDoc;
            eventDoc["type"] = "EVENT";
            eventDoc["mac"] = myMacAddress;
            eventDoc["payload"] = "UID:" + content;
            eventDoc["direction"] = pendingDirection; 
            String eventOut; serializeJson(eventDoc, eventOut);
            webSocket.sendTXT(eventOut);
            
            startBeep(BUZZER_IN_PIN, 3000, 150); 
            
            isRegistrationMode = false; 
            ledsOff(); 
            cooldownDelay = 5000; 
            lastReadTime = millis();
        } else {
            if (pendingDirection == "ENTRY") {
                digitalWrite(YELLOW_LED_IN, HIGH);
            } else {
                digitalWrite(YELLOW_LED_OUT, HIGH);
            }
            
            pendingUID = content; 
            
            JsonDocument reqDoc;
            reqDoc["type"] = "ACCESS_CHECK";
            reqDoc["mac"] = myMacAddress;
            reqDoc["payload"] = "UID:" + content;
            reqDoc["direction"] = pendingDirection;
            String reqOut; serializeJson(reqDoc, reqOut);
            webSocket.sendTXT(reqOut);
            
            cooldownDelay = 2000;
            lastReadTime = millis();
        }
    }
}
