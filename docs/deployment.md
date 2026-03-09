```markdown
# KRA Photo Hub – Deployment Guide

## Overview

This document explains how to deploy and run **KRA Photo Hub** on the local server inside the shop.

The system is designed to run on a **single local computer** that acts as the photo server.

Supported hardware:

- Windows laptop
- Mini PC
- Mac Mini (optional)

Recommended usage:

- server runs locally inside the shop
- dashboard is accessed from an iPad through Wi-Fi
- photos are stored locally and synchronized to NAS

---

# Deployment Architecture

Typical shop deployment:

```

Camera
↓
SD Card
↓
Local Server (Laptop / Mini PC)
↓
Photo Library Storage
↓
NAS Backup
↓
iPad Dashboard (Local Network)

```

All operations happen **inside the local network**.

Internet is not required for normal operation.

---

# Hardware Requirements

## Minimum Hardware

| Component | Requirement |
|----------|-------------|
CPU | Dual-core CPU |
RAM | 8 GB |
Storage | SSD recommended |
Network | Local Wi-Fi connection |
USB | SD card reader |

---

## Recommended Hardware

| Component | Recommendation |
|----------|----------------|
CPU | Intel i5 / Apple M1 |
RAM | 8–16 GB |
Storage | NVMe SSD |
Network | Stable Wi-Fi router |
Backup | NAS storage |

---

# Operating System

Supported systems:

```

Windows 10 / Windows 11
macOS (optional)
Linux (optional)

```

The recommended deployment is **Windows laptop or Mini PC**.

---

# Required Software

The server requires the following software:

```

Node.js (LTS version)
Git

```

Optional tools:

```

VS Code
PM2 (process manager)

```

---

# Step 1 – Install Node.js

Download and install Node.js LTS.

Official site:

```

[https://nodejs.org](https://nodejs.org)

```

After installation verify:

```

node -v
npm -v

```

Example output:

```

v20.x.x
9.x.x

```

---

# Step 2 – Install Git

Install Git to clone the project repository.

Verify installation:

```

git --version

```

Example output:

```

git version 2.x.x

```

---

# Step 3 – Clone Repository

Clone the KRA Photo Hub repository.

Example:

```

git clone [https://github.com/your-org/kra-photo-hub.git](https://github.com/your-org/kra-photo-hub.git)

```

Navigate into project directory:

```

cd kra-photo-hub

```

---

# Step 4 – Install Dependencies

Install required packages.

```

npm install

```

This installs all dependencies defined in:

```

package.json

```

---

# Step 5 – Configure Environment

Create a configuration file:

```

.env

```

Example configuration:

```

SERVER_PORT=3000
PHOTO_LIBRARY_PATH=./storage/photo_library
EXPORT_PATH=./storage/exports
BATCH_PATH=./storage/batches
DATABASE_PATH=./storage/database/kra-photo-hub.db
NAS_SYNC_PATH=//nas/photos

```

These paths control where files are stored.

---

# Step 6 – Prepare Storage Directories

Create required directories.

Example structure:

```

storage/
photo_library/
batches/
exports/
database/
logs/

```

You can create them manually or with a script.

Example command:

```

mkdir storage/photo_library
mkdir storage/batches
mkdir storage/exports
mkdir storage/database
mkdir storage/logs

```

---

# Step 7 – Start Server (Development)

Start the local server:

```

npm run dev

```

The server will start on:

```

[http://localhost:3000](http://localhost:3000)

```

---

# Step 8 – Access Dashboard

Open the dashboard from the iPad or browser.

Example address:

```

[http://192.168.1.50:3000](http://192.168.1.50:3000)

```

Make sure:

- iPad and server are on the same Wi-Fi network
- firewall allows access

---

# Step 9 – Start Server (Production)

For production use, run the server with:

```

npm start

```

or use a process manager like:

```

PM2

```

Example:

```

npm install -g pm2
pm2 start server.js

```

This keeps the server running even if the terminal closes.

---

# Automatic Startup

To start the server automatically when the computer boots:

Example with PM2:

```

pm2 startup
pm2 save

```

This ensures the server restarts after reboot.

---

# Network Configuration

The server must be reachable from the local network.

Example IP address:

```

192.168.1.50

```

Dashboard URL:

```

[http://192.168.1.50:3000](http://192.168.1.50:3000)

```

Ensure:

- server and iPad use same network
- firewall allows port access

Example port:

```

3000

```

---

# NAS Backup Configuration

The server can synchronize photo files to NAS.

Example NAS path:

```

\NAS\photo_archive

```

Or Linux style:

```

/mnt/nas/photos

```

Synchronization can run:

```

after import
scheduled intervals

```

---

# Backup Strategy

Recommended backup layers:

```

Local Photo Library
↓
NAS Backup
↓
Cloud Backup (optional)

```

This ensures photos are protected against:

```

disk failure
accidental deletion
hardware damage

```

---

# Server Operation Schedule

Typical shop schedule:

```

07:00 – Start server
09:00 – Photoshoot sessions begin
22:00 – Shutdown server

```

The server can run continuously if desired.

---

# Maintenance Tasks

Regular maintenance includes:

```

check storage capacity
verify NAS sync
clean temporary batch folders
review system logs

```

Suggested weekly tasks:

```

backup database
archive old exports
check disk health

```

---

# Troubleshooting

## Dashboard cannot connect

Check:

```

server running
correct IP address
network connection
firewall settings

```

---

## Import fails

Possible causes:

```

SD card removed
file read error
disk full

```

Check system logs for details.

---

## ZIP generation fails

Possible causes:

```

disk full
file permission error
corrupted photo file

```

---

# Future Deployment Improvements

Possible improvements include:

```

Docker deployment
auto update system
remote monitoring
multi-server support
cloud dashboard

```

---

# Summary

Deploying KRA Photo Hub requires:

```

Node.js
Git
local storage
network connection

```

Once deployed, the system allows staff to:

```

Import photos
Create customer batches
Generate QR codes
Deliver photos instantly

```

The deployment is designed to be simple, reliable, and suitable for daily operation inside the shop.
```
