# KRA Photo Hub – Project Structure

## Overview

KRA Photo Hub is a local-first photo management system designed for the workflow of Kimono Rental Ann.

The system runs on a **local computer (Windows laptop / Mini PC / Mac Mini)** and provides a **web dashboard accessed from an iPad** inside the shop.

Main goals:

- Import photos from SD cards
- Automatically detect new files
- Organize photos by capture time
- Create customer batches
- Generate QR download links
- Deliver JPEG photos to customers quickly
- Sync photos to NAS and optionally to cloud storage

The system is designed to run **entirely inside the local network** of the shop.

---

# System Components

The system consists of two main components:

### 1. Local Server (Laptop / Mini PC)

Responsibilities:

- Detect SD card
- Scan photo files
- Import JPEG and RAW files
- Store files in local library
- Store metadata in SQLite database
- Create customer batches
- Generate ZIP packages
- Generate QR codes
- Provide API for the dashboard
- Sync files to NAS
- Sync files to cloud (optional)

---

### 2. Dashboard (iPad / iPhone / Browser)

Responsibilities:

- Control the local server
- Trigger SD card scan
- Monitor import progress
- Create customer batches
- Preview photo selections
- Generate delivery QR codes
- Copy share links

The dashboard is a **web UI served by the local server**.

---

# Repository Structure

```

kra-photo-hub/
│
├── apps/
│   ├── server/                 # Local server application
│   │
│   │   ├── api/                # HTTP API endpoints
│   │   ├── services/           # Core business logic
│   │   │   ├── import-service
│   │   │   ├── batch-service
│   │   │   ├── delivery-service
│   │   │   └── sync-service
│   │   │
│   │   ├── database/           # SQLite database models
│   │   ├── workers/            # background tasks
│   │   ├── utils/              # helper functions
│   │   └── server.ts           # main server entry point
│   │
│   └── dashboard/              # Web UI for iPad control panel
│       ├── pages/
│       ├── components/
│       ├── hooks/
│       └── styles/
│
├── storage/                    # Local photo storage
│
│   ├── photo_library/          # Imported photo files
│   │
│   │   └── YYYY/
│   │       └── MM/
│   │           └── DD/
│   │               └── photographer_or_card/
│   │
│   ├── batches/                # Temporary batch folders
│   │
│   ├── exports/                # Generated ZIP packages
│   │
│   └── logs/                   # Import and sync logs
│
├── scripts/                    # Utility scripts
│   ├── dev-start.sh
│   ├── production-start.sh
│   └── cleanup-temp-files.sh
│
├── docs/                       # Project documentation
│   ├── project-structure.md
│   ├── system-architecture.md
│   ├── user-workflow.md
│   ├── features.md
│   ├── api-spec.md
│   ├── database-schema.md
│   ├── import-engine.md
│   ├── batch-engine.md
│   ├── dashboard-ui.md
│   └── deployment.md
│
├── .env                        # environment configuration
├── package.json
└── README.md

```

---

# Storage Layout

All imported photos are stored locally.

Example structure:

```

photo_library/
2026/
03/
09/
photographer_A/
IMG_0001.JPG
IMG_0002.ARW

```

Benefits:

- Easy chronological organization
- Easy backup
- Fast local access

---

# Temporary Storage

```

batches/

```

Contains selected images for each customer batch before packaging.

Example:

```

batches/
batch-2026-03-09-0905/

```

---

# Export Storage

```

exports/

```

Contains generated ZIP files used for customer downloads.

Example:

```

exports/
batch-2026-03-09-0905.zip

```

---

# Logs

```

logs/

```

Stores system activity logs.

Examples:

- import logs
- sync logs
- error logs

---

# Database Location

The SQLite database file will be stored locally.

Example:

```

storage/database/kra-photo-hub.db

```

Database stores:

- photo metadata
- batch records
- delivery status
- sync status

The actual photo files remain on disk.

---

# Local Server Address

The server will run on the local machine.

Example:

```

[http://192.168.1.50:3000](http://192.168.1.50:3000)

```

The iPad dashboard will connect to this address through the shop's Wi-Fi network.

---

# Development Workflow

Typical development workflow:

1. Write code on MacBook
2. Push code to GitHub repository
3. Pull code on the local server machine
4. Run the server
5. Test using iPad dashboard

---

# Production Setup

Production system typically includes:

- Windows laptop or Mini PC running server
- SD card reader
- NAS for backup
- iPad for dashboard control

The server runs during shop hours.

Example schedule:

```

07:00 - Server start
22:00 - Server shutdown

```

---

# Summary

The KRA Photo Hub repository is structured to clearly separate:

- server logic
- dashboard UI
- storage
- documentation

This structure allows:

- easy development
- easy maintenance
- clear expansion in the future
```

---
