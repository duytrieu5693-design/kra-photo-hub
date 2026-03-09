```markdown
# KRA Photo Hub – API Specification

## Overview

This document defines the HTTP API used by **KRA Photo Hub**.

The API is used by the **iPad Dashboard** to control the local server.

The API follows these design principles:

- REST-style endpoints
- JSON request and response format
- simple structure
- optimized for local network usage

The API server runs locally on the photo server machine.

Example base URL:

```

[http://192.168.1.50:3000/api](http://192.168.1.50:3000/api)

```

---

# API Conventions

## Response Format

All API responses use JSON.

Example success response:

```

{
"success": true,
"data": {}
}

```

Example error response:

```

{
"success": false,
"error": "Error message"
}

```

---

# 1. System Status

## GET /api/system/status

Returns the status of the local server.

### Response

```

{
"success": true,
"data": {
"server_running": true,
"storage_available": true,
"nas_connected": true,
"current_import": false
}
}

```

---

# 2. SD Card Detection

## GET /api/card/status

Checks if an SD card is inserted.

### Response

```

{
"success": true,
"data": {
"card_inserted": true,
"mount_path": "/media/sdcard"
}
}

```

---

# 3. Scan Card

## POST /api/card/scan

Scans the SD card for photo files.

### Response

```

{
"success": true,
"data": {
"total_files": 642,
"jpeg_files": 482,
"raw_files": 160,
"already_imported": 494,
"new_files": 148
}
}

```

---

# 4. Start Import

## POST /api/import/start

Starts importing new photo files from the SD card.

### Request

```

{
"source_path": "/media/sdcard/DCIM"
}

```

### Response

```

{
"success": true,
"data": {
"import_started": true
}
}

```

---

# 5. Import Progress

## GET /api/import/progress

Returns the current import progress.

### Response

```

{
"success": true,
"data": {
"running": true,
"total_files": 148,
"files_copied": 92,
"progress_percent": 62,
"copy_speed_mb": 40
}
}

```

---

# 6. Import Result

## GET /api/import/result

Returns summary of the last import operation.

### Response

```

{
"success": true,
"data": {
"imported_files": 148,
"jpeg_files": 103,
"raw_files": 45,
"skipped_files": 494
}
}

```

---

# 7. Photo Search by Time

## POST /api/photos/search

Find photos by capture time.

### Request

```

{
"start_time": "2026-03-09T09:05:00",
"end_time": "2026-03-09T10:05:00"
}

```

### Response

```

{
"success": true,
"data": {
"photo_count": 48,
"first_photo": "IMG_1021.JPG",
"last_photo": "IMG_1068.JPG"
}
}

```

---

# 8. Create Batch

## POST /api/batch/create

Creates a batch from selected photos.

### Request

```

{
"start_time": "2026-03-09T09:05:00",
"end_time": "2026-03-09T10:05:00"
}

```

### Response

```

{
"success": true,
"data": {
"batch_id": "batch-2026-03-09-0905",
"photo_count": 48
}
}

```

---

# 9. Batch List

## GET /api/batch/list

Returns list of created batches.

### Response

```

{
"success": true,
"data": [
{
"batch_id": "batch-2026-03-09-0905",
"photo_count": 48,
"created_at": "2026-03-09T10:15:00",
"delivery_status": "ready"
}
]
}

```

---

# 10. Batch Details

## GET /api/batch/{batch_id}

Returns detailed information about a batch.

### Response

```

{
"success": true,
"data": {
"batch_id": "batch-2026-03-09-0905",
"photo_count": 48,
"zip_generated": true,
"download_url": "/download/batch-2026-03-09-0905"
}
}

```

---

# 11. Generate ZIP

## POST /api/batch/{batch_id}/generate-zip

Generates ZIP archive for a batch.

### Response

```

{
"success": true,
"data": {
"zip_created": true,
"zip_file": "batch-2026-03-09-0905.zip"
}
}

```

---

# 12. Generate QR Code

## POST /api/batch/{batch_id}/generate-qr

Generates QR code for photo download.

### Response

```

{
"success": true,
"data": {
"download_url": "[http://192.168.1.50:3000/download/batch-2026-03-09-0905](http://192.168.1.50:3000/download/batch-2026-03-09-0905)",
"qr_code_url": "/qr/batch-2026-03-09-0905.png"
}
}

```

---

# 13. Download Batch

## GET /download/{batch_id}

Customer download endpoint.

This endpoint returns the ZIP file containing all JPEG photos.

Example:

```

GET /download/batch-2026-03-09-0905

```

Response:

```

Content-Type: application/zip

```

---

# 14. System Logs

## GET /api/system/logs

Returns recent system logs.

### Response

```

{
"success": true,
"data": [
{
"time": "2026-03-09T09:45:12",
"event": "import_completed",
"message": "148 photos imported"
}
]
}

```

---

# 15. Server Restart

## POST /api/system/restart

Restarts the local server.

### Response

```

{
"success": true,
"message": "Server restarting"
}

```

---

# Security Considerations

Since the system runs on a **local network only**, authentication requirements are minimal.

Possible future improvements:

- local password protection
- device whitelist
- admin access control

---

# API Summary

Main API categories:

```

System API
Card API
Import API
Photo API
Batch API
Delivery API
Logs API

```

These APIs allow the dashboard to fully control the photo management workflow of KRA Photo Hub.
```
