# Smart Physical Access Control System (PACS) & IoT Security Platform

An enterprise-grade, end-to-end **Physical Access Control System (PACS)** and IoT security management platform. The system bridges physical microcontroller hardware (**ESP32 with dual PN532 NFC readers**), a high-performance **WebSocket Gateway**, a deterministic **Anti-Passback (APB) Security Engine**, and a modern **Next.js 16 (App Router)** management dashboard with real-time telemetry and automated attendance analytics.

---

## Key System Capabilities

* **Sub-Second Real-Time Telemetry**: Bidirectional WebSocket gateway (`ws-server.ts`) connecting physical/simulated controllers and web clients with live status synchronization.
* **Strict Anti-Passback (APB) Engine**: Prevents badge sharing and tailgating by maintaining and enforcing real-time occupancy state per credential.
* **Role-Based Access Control (RBAC)**:
  * **Administrators**: Device fleet management, employee credential provisioning, door access matrices, audit trails, and over-the-air remote door actuation.
  * **Employees**: Self-service portal, digital badge overview, real-time presence indicators, and daily/weekly work hours tracking.
  * **Guests**: Temporary passes with strict validity time windows and automated expiration.
* **Analytics & Visual Dashboards**:
  * Weekly entry/exit distribution and automated daily work hours calculation.
  * 24-hour peak access load distribution heatmap.
  * Security incident breakdown (Granted vs. Denied vs. Forced Entry Intrusions).
* **Intrusion & Tamper Detection**: Instant alarm dispatching upon physical door breach (detected via magnetic reed switch when no valid badge unlock was granted).
* **Interactive Hardware Simulator (CLI)**: Full interactive terminal simulator enabling end-to-end testing of hardware handshakes, NFC swipes, sensor state changes, and intrusion alarms without physical hardware.
* **Audit Logging & CSV Export**: Secure access logs with UTF-8 BOM encoding for seamless Microsoft Excel and spreadsheet compatibility.

---

## System Architecture

```mermaid
flowchart TB
    subgraph Hardware["IoT Hardware Layer (ESP32)"]
        NFC_IN["PN532 Reader (Entry)\nI2C Bus 0 (Wire)"]
        NFC_OUT["PN532 Reader (Exit)\nI2C Bus 1 (Wire1)"]
        RELAY["Relay Actuator\n(NO / NC Configurable)"]
        SENSOR["Magnetic Door Sensor\n(Reed Switch)"]
        BUZZER["Buzzer & Status LEDs"]
    end

    subgraph Gateway["WebSocket Gateway (:8080)"]
        WS_SRV["Connection Manager\n& Watchdog Ping"]
        APB_ENG["Anti-Passback &\nAccess Decision Engine"]
        LOGGER["Structured Audit Logger"]
    end

    subgraph WebApp["Next.js 16 Web Application (:3000)"]
        DASH["Admin Dashboard\n& Employee Portal"]
        ACTIONS["Server Actions\n& Zod Validation"]
        API["HTTP Hardware Config API"]
    end

    subgraph Database["PostgreSQL + Prisma ORM"]
        USERS["Users & Credentials"]
        DEVICES["Device Fleet & Keys"]
        LOGS["Access Logs & Metrics\n(Indexed)"]
    end

    subgraph Simulator["Interactive CLI Simulator"]
        SIM_CLI["simulator/cli.ts"]
    end

    NFC_IN -->|ACCESS_CHECK| WS_SRV
    NFC_OUT -->|ACCESS_CHECK| WS_SRV
    SENSOR -->|PASSAGE_CONFIRMED / DOOR_EVENT| WS_SRV
    WS_SRV -->|ACCESS_RESPONSE / COMMAND| RELAY
    WS_SRV -->|Tone / LED Signal| BUZZER

    SIM_CLI <-->|Simulated Protocol| WS_SRV

    WS_SRV <--> APB_ENG
    APB_ENG <--> Database
    WS_SRV --- LOGGER
    WebApp <--> Database
    WS_SRV -.->|Broadcast Status| WebApp
```

---

## Technology Stack

| Domain | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend** | [Next.js 16](https://nextjs.org/) (App Router, Server Components, Server Actions), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Recharts](https://recharts.org/), [Heroicons](https://heroicons.com/) | Modern, responsive dashboard and employee pass management |
| **Backend & WS** | [Node.js 20+](https://nodejs.org/), [TypeScript](https://www.typescriptlang.org/), [ws](https://github.com/websockets/ws), [jose](https://github.com/panva/jose), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [Zod](https://zod.dev/) | High-concurrency IoT gateway, JWT session validation, schema contracts |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/), [Prisma ORM](https://www.prisma.io/) | Relational storage with compound indexes on access logs and foreign keys |
| **Testing** | [Vitest](https://vitest.dev/) | Unit & integration tests for access evaluation and work hours engine |
| **Embedded / IoT** | ESP32-WROOM-32, C++, [Adafruit_PN532](https://github.com/adafruit/Adafruit-PN532), [ArduinoJson](https://arduinojson.org/), [WiFiManager](https://github.com/tzapu/WiFiManager) | Microcontroller firmware for NFC scanning, relay switching, and magnetic sensing |
| **DevOps & Tooling** | Docker, Docker Compose | Containerized database and reproducible local environment |

---

## Hardware Pinout & Wiring Specification

The hardware controller firmware runs on an **ESP32-WROOM-32** development board with dual I2C buses for concurrent Entry and Exit readers:

| Component | ESP32 GPIO | Interface / Protocol | Function |
| :--- | :--- | :--- | :--- |
| **PN532 Reader #1 (Entry)** | GPIO 21 (SDA), GPIO 22 (SCL) | I2C (Bus 0 - `Wire`) | Captures NFC/RFID tag UID at entry point |
| **PN532 Reader #2 (Exit)** | GPIO 32 (SDA), GPIO 33 (SCL) | I2C (Bus 1 - `Wire1`) | Captures NFC/RFID tag UID at exit point |
| **Relay Actuator** | GPIO 26 | Digital Output | Controls electronic strike or magnetic lock |
| **Door Magnetic Sensor** | GPIO 27 | Digital Input (Pull-up) | Monitors door physical state (Open / Closed) |
| **Buzzer / Audio** | GPIO 25 | Digital Output (PWM) | Success/Denied acoustic feedback |
| **Status LED (Green)** | GPIO 18 | Digital Output | Visual access granted indicator |
| **Status LED (Red)** | GPIO 19 | Digital Output | Visual access denied indicator |

---

## WebSocket Gateway Protocol

The WebSocket Gateway operates on port `8080` (or `PORT` env) with standard JSON payloads:

### 1. Device Handshake (`REGISTER`)
```json
{
  "type": "REGISTER",
  "mac": "24:0A:C4:00:01:01",
  "key": "dev_key_main_turnstile_01"
}
```
*Gateway Response:* `{"type": "SYSTEM", "command": "REGISTER_OK"}`

### 2. Access Request (`ACCESS_CHECK`)
```json
{
  "type": "ACCESS_CHECK",
  "mac": "24:0A:C4:00:01:01",
  "payload": "UID:A1-B2-C3-D4",
  "direction": "ENTRY"
}
```
*Gateway Response:*
```json
{
  "type": "ACCESS_RESPONSE",
  "status": "GRANTED",
  "relayTime": 5,
  "relayType": "NO"
}
```

### 3. Physical Passage Confirmation (`PASSAGE_CONFIRMED`)
Sent when a turnstile rotates or the door opens and closes after an authorized scan:
```json
{
  "type": "PASSAGE_CONFIRMED",
  "mac": "24:0A:C4:00:01:01",
  "payload": "UID:A1-B2-C3-D4",
  "direction": "ENTRY"
}
```

### 4. Door Magnetic Sensor Event (`DOOR_EVENT`)
```json
{
  "type": "DOOR_EVENT",
  "mac": "24:0A:C4:00:01:01",
  "payload": "OPENED"
}
```

### 5. Forced Entry Intrusion Alarm (`INTRUSION_ALERT`)
Sent when the door sensor opens without prior authorized badge unlock:
```json
{
  "type": "INTRUSION_ALERT",
  "mac": "24:0A:C4:00:01:01"
}
```

### 6. Over-the-Air Remote Unlock Command (`COMMAND`)
Dispatched from Admin Dashboard to actuator:
```json
{
  "type": "COMMAND",
  "target": "24:0A:C4:00:01:01",
  "command": "UNLOCK",
  "userId": "admin_cuid_here"
}
```

---

## Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# PostgreSQL Connection URLs (Prisma)
POSTGRES_PRISMA_URL="postgresql://acs_user:acs_password@localhost:5432/access_control_db?schema=public"
POSTGRES_URL_NON_POOLING="postgresql://acs_user:acs_password@localhost:5432/access_control_db?schema=public"

# Authentication & Session Security (JWT)
JWT_SECRET="your-32-character-production-secret-key-here"

# WebSocket Server Configuration
PORT=8080
NEXT_PUBLIC_WS_URL="ws://localhost:8080"
```

---

## Quickstart & Local Setup

### 1. Prerequisites
* **Node.js**: `v20.x` or higher
* **pnpm** (or npm / yarn)
* **Docker** (for containerized PostgreSQL)

### 2. Installation
```bash
# Clone repository
git clone https://github.com/dima91020/diploma-access-control.git
cd diploma-access-control

# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
```

### 3. Database Initialization
```bash
# Start local PostgreSQL container (optional)
docker compose up -d

# Sync Prisma schema to database
pnpm prisma db push

# Seed demo data (Admin, Employees, Devices, Historical Logs)
pnpm db:seed
```

### 4. Running the Services

In separate terminal tabs:

```bash
# Terminal 1: Next.js Web Application (Port 3000)
pnpm dev

# Terminal 2: WebSocket Hardware Gateway (Port 8080)
pnpm ws

# Terminal 3: Interactive Hardware Simulator (CLI)
pnpm simulator
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> **Pre-Seeded Demo Credentials:**
> * **Administrator**: `admin@demo.com` / `admin123`
> * **Employee**: `alice@company.com` / `user123`

---

## Interactive Hardware Simulator

The project includes an interactive terminal simulator (`pnpm simulator`) that emulates a physical ESP32 turnstile node:

```text
================================================
   SMART ACCESS CONTROL - DEVICE SIMULATOR       
================================================
Connecting to Gateway: ws://localhost:8080
Device MAC: 24:0A:C4:00:01:01

--- Interactive Simulator Menu ---
 [1] Scan Card (Swipe NFC Tag at Entry)
 [2] Scan Card (Swipe NFC Tag at Exit)
 [3] Confirm Passage (Physical Door / Turnstile passed)
 [4] Toggle Door Sensor (OPEN / CLOSED)
 [5] Trigger Intrusion Alert (Tamper/Forced Entry)
 [6] Toggle Auto-Simulation (Automated realistic traffic)
 [c] Custom UID Entry
 [h] Help menu
 [q] Quit simulator
```

---

## Automated Testing

Run the automated Vitest test suite covering:
* Anti-Passback state enforcement rules.
* Temporary guest pass expiration windows.
* Work hours accumulation & duration calculation.
* Device whitelist permission resolution.

```bash
pnpm test
```

---

## Project Structure

```text
├── app/
│   ├── (auth)/
│   │   ├── login/               # Secure admin/employee authentication
│   │   ├── register/            # Organization setup & admin onboarding
│   │   ├── forgot-password/     # Password recovery workflow
│   │   └── new-password/        # Token-based password reset
│   ├── api/
│   │   ├── export/logs/         # CSV audit log export with UTF-8 BOM
│   │   └── hardware/config/     # Over-the-air relay timing API for hardware
│   ├── dashboard/
│   │   ├── devices/             # Device inventory, relay configuration & unlocks
│   │   ├── logs/                # Real-time searchable access audit trail
│   │   ├── settings/            # Security & profile settings
│   │   ├── users/               # Personnel management & access matrix
│   │   └── page.tsx             # Overview metrics & activity dashboard
│   ├── lib/
│   │   ├── access-control.ts    # Deterministic APB & permission evaluation engine
│   │   ├── prisma.ts            # Prisma client singleton
│   │   └── session.ts           # JWT session verification & cookie handlers
│   └── ui/
│       ├── badge.tsx            # Minimalist, modern status badge component
│       ├── dashboard/           # Metrics cards, live telemetry & Recharts widgets
│       └── logs/                # Audit log cards & custom filter controls
├── firmware/
│   └── esp32_acs.ino            # Production C++ firmware for ESP32 + Dual PN532
├── prisma/
│   ├── schema.prisma            # Relational database schema & indexes
│   └── seed.ts                  # Database seeding script with realistic data
├── simulator/
│   └── cli.ts                   # Interactive terminal IoT simulator
├── tests/
│   └── access-control.test.ts   # Vitest unit test suite
├── ws-server.ts                 # High-throughput WebSocket Gateway
├── docker-compose.yml           # Local PostgreSQL container specification
└── package.json                 # Project scripts and dependencies
```

---

## Security Architecture & Design Decisions

1. **Anti-Passback Invariant Enforcement**:
   * Occupancy tracking updates occur strictly upon physical passage confirmation (`PASSAGE_CONFIRMED`) rather than raw scan events, preventing state desynchronization if a user cancels entry.
2. **Defensive Authentication**:
   * Constant-time verification with `bcryptjs` and uniform error messages to prevent account enumeration.
   * `httpOnly`, `secure`, and `sameSite: 'lax'` cookie attributes for session tokens.
3. **Database Performance & Reliability**:
   * Strategic composite indexes on `Log(deviceId, timestamp)` and `Log(userId, timestamp)` for high-speed audit queries.
   * Prisma transactions ensure atomic state transitions across user presence and log records.
4. **Hardware Resilience & Fail-Safe Modes**:
   * Heartbeat ping/pong watchdog (every 10 seconds) prevents zombie connections.
   * Offline fail-safe relay configuration (NO/NC) stored persistently in ESP32 Non-Volatile Storage (NVS).

---

## License & Authors

Developed for Academic Diploma Project.
Published under the **MIT License**.
