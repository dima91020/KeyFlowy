# 📟 Smart Access Control System - ESP32 Firmware

This directory contains the embedded C++/Arduino firmware for the **Smart Access Control System (ACS)** hardware node based on **ESP32** and dual **PN532 NFC/RFID** readers.

---

## 🛠️ Hardware Requirements

* **Microcontroller**: ESP32-WROOM-32 (NodeMCU or custom PCB)
* **NFC/RFID Modules**: 2x Adafruit PN532 (Configured in I2C Mode)
* **Relay Module**: 1-Channel Optocoupler Relay (Configurable NO/NC)
* **Door Sensor**: Magnetic Reed Switch (Dry Contact, Input Pull-Up)
* **Indicators**:
  * 2x RGB or 3-color discrete LEDs (Green, Red, Yellow) for Entry & Exit sides
  * 2x Passive Buzzers (PWM-driven tone generation)

---

## 📌 Pinout Mapping

| Component | Function | ESP32 GPIO Pin |
| :--- | :--- | :--- |
| **I2C Bus 0 (Entry Reader)** | SDA / SCL | `GPIO 21` / `GPIO 22` |
| **I2C Bus 1 (Exit Reader)** | SDA / SCL | `GPIO 17` / `GPIO 5` |
| **Relay Output** | Lock Actuator Control | `GPIO 13` |
| **Door Sensor** | Magnetic Reed Switch | `GPIO 16` (Internal Pull-Up) |
| **Entry Buzzer** | Audio Feedback (Entry) | `GPIO 4` |
| **Exit Buzzer** | Audio Feedback (Exit) | `GPIO 32` |
| **Entry LEDs** | Green / Red / Yellow | `GPIO 14` / `GPIO 26` / `GPIO 27` |
| **Exit LEDs** | Green / Red / Yellow | `GPIO 25` / `GPIO 33` / `GPIO 2` |

---

## ⚡ Key Features

1. **Dual Independent I2C Buses (`TwoWire(0)` and `TwoWire(1)`)**:
   Enables two PN532 readers with the same default I2C address (`0x24`) to operate simultaneously for Entry and Exit without hardware address hacking.
2. **Real-time Bidirectional WebSocket Protocol**:
   Sub-second access verification and real-time remote commands (`UNLOCK`, `UPDATE_CONFIG`, `RESET_WIFI`).
3. **Anti-Passback (APB) State Tracking**:
   Physical passage verification via magnetic door sensor (`PASSAGE_CONFIRMED`).
4. **Intrusion & Tamper Detection**:
   Instant trigger of alarm if the door is forced open without a prior authorized access grant.
5. **WiFiManager Captive Portal**:
   Automatic fallback to setup AP (`SecurePass-Setup`) when Wi-Fi is unconfigured or unavailable.
