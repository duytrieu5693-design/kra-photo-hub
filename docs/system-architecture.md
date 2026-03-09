```markdown
# KRA Photo Hub – System Architecture

## Overview

KRA Photo Hub is a **local-first photo management system** designed for the operational workflow of Kimono Rental Ann.

The system allows staff to:

- Import photos from SD cards used by photographers
- Detect new files automatically
- Organize photos based on capture time
- Create customer-specific photo batches
- Generate QR codes for instant photo delivery
- Provide downloadable ZIP files
- Sync photos to NAS and optionally cloud storage

The entire system is designed to operate **inside the shop's local network**, ensuring:

- Fast performance
- Data privacy
- Independence from internet connectivity

---

# High-Level Architecture

The system consists of the following main components:

```

Photographer Camera
│
▼
SD Card
│
▼
Local Server (Laptop / Mini PC)
│
├── Photo Import Engine
├── Metadata Processing
├── Batch Management
├── ZIP Generator
├── QR Generator
└── HTTP API Server
│
▼
SQLite Database + Local Storage
│
├── NAS Sync
└── Cloud Sync (optional)
│
▼
iPad Dashboard (Web UI)
│
▼
Customer Photo Download

```

---

# Component Breakdown

## 1. Camera and SD Card

Photographers capture photos using cameras that store images on SD cards.

Photo types include:

- JPEG (used for customer delivery)
- RAW (used for editing and archival)

The SD card is physically inserted into the local server machine using a USB card reader.

---

## 2. Local Server

The local server is the **central processing unit** of the system.

It runs on:

- Windows laptop
- Mini PC
- Mac Mini (optional)

Responsibilities include:

- Detecting inserted SD cards
- Scanning photo files
- Importing new files
- Storing metadata
- Managing photo batches
- Generating downloadable packages
- Serving the dashboard UI
- Providing API endpoints

The server runs continuously during shop hours.

---

## 3. Photo Import Engine

The import engine performs the following tasks:

1. Scan the SD card file system
2. Identify photo files
3. Filter supported formats
4. Detect duplicate files
5. Copy new files to local storage
6. Extract metadata (EXIF)
7. Store metadata in the database

Supported file types:

```

JPEG
JPG
RAW (ARW / CR2 / NEF depending on camera)

```

Duplicate detection ensures previously imported photos are not copied again.

---

## 4. Metadata Processing

Metadata is extracted from the photo files.

Important fields include:

- capture_time
- file_name
- file_size
- camera_model
- lens
- file_hash

The most important field is:

```

capture_time

```

This value is used to group photos into customer batches.

---

## 5. Local Photo Library

Imported photos are stored in a structured directory.

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

- chronological organization
- easy backup
- scalable storage
- fast local access

RAW and JPEG files are preserved.

---

## 6. Database Layer

The system uses **SQLite** as the local database.

The database stores:

- photo metadata
- batch information
- delivery records
- file import status
- sync status

The database does not store the actual photo files.

It only references file paths.

---

## 7. Batch Management System

A batch represents a **group of photos belonging to one customer session**.

Staff creates a batch by selecting:

- start time
- end time

The system filters photos with:

```

capture_time between start_time and end_time

```

Batch data includes:

- batch_id
- photo list
- total photo count
- generated ZIP file
- QR download link

---

## 8. ZIP Generation

After a batch is confirmed, the system:

1. Collects JPEG files from the batch
2. Creates a ZIP archive
3. Stores the archive in the export directory

Example:

```

exports/
batch-2026-03-09-0905.zip

```

This ZIP file is used for customer downloads.

---

## 9. QR Code Generation

Once the ZIP file is created, the system generates a QR code pointing to the download URL.

Example URL:

```

[http://192.168.1.50:3000/download/batch-2026-03-09-0905](http://192.168.1.50:3000/download/batch-2026-03-09-0905)

```

The QR code allows customers to:

- scan using their phone
- instantly download photos

---

## 10. HTTP API Server

The server exposes an API used by the dashboard.

Example endpoints include:

```

POST /api/scan-card
POST /api/import
GET  /api/import-progress
POST /api/create-batch
POST /api/generate-zip
GET  /api/batch/:id

```

All processing happens on the server.

The dashboard only sends commands.

---

## 11. Dashboard (iPad Web UI)

The dashboard is a web interface accessed from:

- iPad
- iPhone
- Laptop browser

Example access:

```

[http://192.168.1.50:3000](http://192.168.1.50:3000)

```

The dashboard allows staff to:

- scan SD card
- monitor import progress
- create customer batches
- preview photos
- generate QR codes
- copy download links

---

## 12. NAS Synchronization

Imported photos are synchronized to a NAS device.

Purpose:

- backup
- long-term storage
- archive

The sync process runs in the background.

---

## 13. Optional Cloud Sync

The NAS may also sync to:

- Google Drive
- other cloud storage

This allows staff to send links to customers who did not download photos in the shop.

---

# Network Architecture

All devices operate inside the shop's internal network.

Example setup:

```

Router
│
├── Local Server (192.168.1.50)
├── iPad Dashboard
└── NAS Storage

```

The iPad connects to the server through the router.

No internet connection is required for core operations.

---

# Data Flow

Typical workflow:

```

Camera
↓
SD Card
↓
Insert into Local Server
↓
Scan Files
↓
Import New Photos
↓
Store Files in Library
↓
Extract Metadata
↓
Create Customer Batch
↓
Generate ZIP Package
↓
Generate QR Code
↓
Customer Scans QR
↓
Download Photos

```

---

# Reliability Design

Key reliability features include:

- duplicate detection during import
- local storage before NAS sync
- batch preview before delivery
- logs for all import operations

The system prioritizes:

- speed
- reliability
- simplicity

---

# Scalability

The architecture allows future expansion:

- cloud dashboard
- remote photo delivery
- automated batch detection
- photographer tracking
- AI photo tagging
- editing workflow integration

The current design focuses on **fast in-shop delivery**, which is the primary business requirement.

---

# Summary

KRA Photo Hub architecture follows these principles:

- local-first system
- simple server design
- clear separation of storage and metadata
- efficient batch delivery workflow
- scalable future expansion

The system is optimized specifically for the operational needs of Kimono Rental Ann.
```
