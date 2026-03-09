# KRA Photo Hub

Local photo management system for Kimono Rental Ann.

Staff control the system from an iPad via local Wi-Fi. The server runs on a Windows laptop or Mini PC.

## Overview

```
Camera → SD Card → Local Server → Photo Library → Customer ZIP → QR Code → Customer Phone
```

## Prerequisites

- **Node.js** v20 LTS — https://nodejs.org
- **npm** v9+

Verify after installing:
```
node -v
npm -v
```

## Installation

```bash
# 1. Clone or copy the project
cd kra-photo-hub

# 2. Install all dependencies
npm install

# 3. Copy and configure environment
cp .env.example .env
```

## Configuration (.env)

Edit `.env` with your settings:

```env
SERVER_PORT=3000
HOST=0.0.0.0

# Storage paths (auto-created on startup)
PHOTO_LIBRARY_PATH=./storage/photo_library
EXPORT_PATH=./storage/exports
BATCH_PATH=./storage/batches
DATABASE_PATH=./storage/database/kra-photo-hub.db
LOGS_PATH=./storage/logs
QR_PATH=./storage/qr

# SD card path — set this to your SD card drive
# Windows: D:\DCIM or E:\DCIM
# Mac: /Volumes/SDCARD/DCIM
SD_CARD_PATH=D:\DCIM

# Your server's local IP (shown when you run the server)
SERVER_BASE_URL=http://192.168.1.50:3000
```

### Finding your local IP address

**Windows:** Open Command Prompt → `ipconfig` → look for `IPv4 Address`
**Mac:** System Preferences → Network → look for IP address

## Running (Development)

### Both server + dashboard together:
```bash
npm run dev
```

### Server only:
```bash
npm run server
```

### Dashboard only (in another terminal):
```bash
npm run dashboard
```

**Server runs at:** http://localhost:3000
**Dashboard runs at:** http://localhost:5173 (dev) or http://localhost:3000 (after build)

## Running (Production)

```bash
# Build dashboard
npm run build

# Start server (serves dashboard + API)
npm start
```

Access at: `http://localhost:3000`

## Accessing from iPad

1. Make sure server is running
2. Make sure iPad and server are on **same Wi-Fi network**
3. Open Safari on iPad
4. Go to: `http://YOUR_SERVER_IP:3000`

Example: `http://192.168.1.50:3000`

To find your server's IP:
- **Windows:** `ipconfig` in Command Prompt
- **Mac:** System Preferences → Network

### Firewall (Windows)

Allow Node.js through Windows Firewall when prompted, or manually:
1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule → Port → TCP 3000 → Allow

## How to Choose SD Card Source Folder

1. Insert SD card into card reader
2. Open your file browser to find the drive letter (e.g., `D:\` or `E:\`)
3. Set `SD_CARD_PATH=D:\DCIM` in `.env`
4. Or enter the path directly in the Import screen on the dashboard

Common SD card paths:
- `D:\DCIM` (Windows)
- `E:\DCIM` (Windows, alternate drive)
- `/Volumes/SDCARD/DCIM` (Mac)
- `/media/username/SDCARD/DCIM` (Linux)

## Workflow

### Daily Photo Workflow

1. **Import Photos**
   - Insert SD card
   - Go to Import screen
   - Tap "Scan Source" — shows how many new files
   - Tap "Import New Files" — copies to library
   - Wait for progress bar to complete

2. **Create Customer Batch**
   - Go to Batch screen
   - Enter session start time (when customer arrived)
   - Enter session end time (when shooting ended)
   - Tap "Search Photos" — shows count preview
   - Tap "Create Batch"

3. **Deliver to Customer**
   - Open the batch
   - Tap "Generate ZIP" — packages JPEG files
   - Tap "Generate QR Code" — creates QR for download
   - Customer scans QR code with phone
   - Photos download directly to customer's device

## Storage Structure

```
storage/
  photo_library/     ← All imported photos (organized by date)
    2026/
      03/
        09/
          IMG_1234.JPG
          IMG_1234.ARW
  batches/           ← Batch metadata (reserved for future use)
  exports/           ← Generated ZIP files for customer delivery
  database/          ← SQLite database file
  logs/              ← Reserved for log files
  qr/                ← Generated QR code images
```

Photos are organized by capture date automatically:
`photo_library/YYYY/MM/DD/FILENAME`

## Auto-Start on Windows Boot (Optional)

Using PM2:
```bash
npm install -g pm2

# Build first
npm run build

# Start with PM2
cd apps/server
pm2 start dist/index.js --name "kra-photo-hub"

# Save and enable auto-start
pm2 startup
pm2 save
```

## Supported File Types

| Type | Extensions | Customer Delivery |
|------|-----------|-------------------|
| JPEG | .jpg, .jpeg | ✅ Yes (included in ZIP) |
| RAW | .arw, .cr2, .cr3, .nef, .nrw, .orf, .rw2, .dng, .raw | ❌ No (archived only) |

## Troubleshooting

**Dashboard cannot connect from iPad:**
- Verify server is running
- Verify correct IP in browser
- Check Windows Firewall allows port 3000
- Confirm iPad and server on same Wi-Fi

**Import fails with "path does not exist":**
- Check SD card is properly inserted
- Verify drive letter in `.env` SD_CARD_PATH
- Try entering path manually in Import screen

**No photos found when creating batch:**
- Photos must be imported first
- EXIF capture time must be within the selected range
- Only JPEG files appear in batch search

**ZIP download fails:**
- Generate ZIP first from batch detail screen
- Check storage disk has free space

## API Reference

The server exposes a REST API at `/api`:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/system/status | Server and storage status |
| GET | /api/card/status | SD card detection |
| POST | /api/card/scan | Scan source folder |
| POST | /api/import/start | Start photo import |
| GET | /api/import/progress | Import progress |
| GET | /api/import/result | Import summary |
| POST | /api/photos/search | Search by time range |
| POST | /api/batch/create | Create new batch |
| GET | /api/batch/list | List all batches |
| GET | /api/batch/:id | Batch details |
| POST | /api/batch/:id/generate-zip | Generate ZIP |
| POST | /api/batch/:id/generate-qr | Generate QR code |
| GET | /download/:id | Download batch ZIP |
| GET | /api/system/logs | System logs |

## NPM Scripts

```bash
npm run dev            # Start both server + dashboard in dev mode
npm run build          # Build both for production
npm start              # Start production server
npm run server         # Start server only (dev)
npm run dashboard      # Start dashboard only (dev)
npm run server:build   # Build server
npm run dashboard:build # Build dashboard
```
