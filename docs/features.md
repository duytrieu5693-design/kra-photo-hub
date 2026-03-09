```markdown
# KRA Photo Hub – Feature Specification

## Overview

This document defines all major features of **KRA Photo Hub**.

The goal of the system is to enable **fast and reliable delivery of photos to customers in the shop** while maintaining an organized photo archive and backup system.

The system is designed to:

- minimize manual work
- reduce human error
- deliver photos quickly
- maintain structured storage
- support future automation

---

# Core Feature Groups

The system features are divided into the following functional areas:

1. SD Card Management
2. Photo Import System
3. Metadata Processing
4. Photo Library Management
5. Batch Management
6. Photo Delivery System
7. Dashboard Interface
8. File Synchronization
9. Error Handling
10. Logging and Monitoring
11. Future Expansion Features

---

# 1. SD Card Management

## Detect SD Card

The system automatically detects when an SD card is inserted into the local server.

Supported connection methods:

- SD card reader
- USB card reader
- camera USB connection (optional)

The system identifies the card mount location and prepares it for scanning.

---

## Scan Card

Staff can press:

```

Scan Card

```

The system scans the SD card and analyzes:

- total files
- supported image formats
- previously imported files
- new files ready for import

Supported formats include:

```

JPEG
JPG
RAW (ARW / CR2 / NEF depending on camera)

```

The dashboard displays a summary of scan results.

---

# 2. Photo Import System

## Import New Files

Staff can press:

```

Import New Files

```

The system performs:

1. file comparison
2. duplicate detection
3. copying of new files
4. metadata extraction
5. database update

Only files not previously imported are copied.

---

## Duplicate Detection

The system detects duplicates using:

- file name
- file size
- file hash (optional)
- capture timestamp

This ensures that photos are not imported twice even if the same SD card is scanned again.

---

## Import Progress Monitoring

During the import process the dashboard displays:

- total files
- files copied
- progress percentage
- estimated remaining time
- copy speed

Example display:

```

Import Progress: 65%
Copied: 98 / 150 files
Speed: 40 MB/s

```

---

# 3. Metadata Processing

## EXIF Data Extraction

After importing photos, the system extracts metadata from EXIF fields.

Important metadata includes:

```

capture_time
camera_model
lens
image_resolution
file_size

```

The most important value is:

```

capture_time

```

This field is used to group photos into customer sessions.

---

## Photo Timestamp Indexing

Photos are indexed by capture time in the database.

This enables fast filtering when creating batches.

---

# 4. Photo Library Management

## Structured Photo Storage

All imported photos are stored in a structured directory system.

Example:

```

photo_library/
YYYY/
MM/
DD/

```

Example path:

```

photo_library/2026/03/09/

```

Benefits:

- easy backup
- fast navigation
- scalable storage

---

## RAW and JPEG Preservation

Both formats are preserved:

- JPEG for delivery
- RAW for editing and archive

RAW files are not included in customer downloads.

---

# 5. Batch Management

## Create Customer Batch

Staff can create a batch by selecting:

```

Start Time
End Time

```

Example:

```

Start: 09:05
End: 10:05

```

The system selects all photos where:

```

capture_time BETWEEN start_time AND end_time

```

---

## Batch Preview

Before confirming the batch the dashboard shows:

- number of photos
- first photo
- last photo
- capture time range

This helps staff verify correct selection.

---

## Batch Storage

Each batch record stores:

- batch ID
- time range
- photo count
- delivery status
- generated download link

---

# 6. Photo Delivery System

## ZIP Package Generation

After batch creation the system generates a ZIP archive containing JPEG photos.

Example:

```

batch-2026-03-09-0905.zip

```

This file is stored in the export directory.

---

## QR Code Generation

The system generates a QR code for the batch download link.

Example link:

```

[http://192.168.1.50:3000/download/batch-id](http://192.168.1.50:3000/download/batch-id)

```

Customers scan the QR code to download their photos.

---

## Download Page

The download page displays:

- batch name
- number of photos
- download button

The customer downloads a ZIP file containing all JPEG photos.

---

# 7. Dashboard Interface

The dashboard is accessed from an iPad or browser.

Primary dashboard functions include:

```

Scan Card
Import Photos
Create Batch
View Batch History
Generate QR Code
Copy Download Link

```

---

## Import Progress Screen

Displays real-time import status.

Example information:

- files copied
- speed
- estimated completion time

---

## Batch Management Screen

Displays:

- list of created batches
- photo counts
- delivery status

Staff can reopen batches to regenerate QR codes.

---

# 8. File Synchronization

## NAS Synchronization

Imported photos are automatically synchronized to a NAS device.

Purpose:

- backup
- editing workflow
- long-term storage

NAS synchronization runs in the background.

---

## Cloud Sync (Optional)

The NAS may also sync to:

- Google Drive
- other cloud storage

This allows remote access and backup.

---

# 9. Error Handling

## SD Card Removal

If the SD card is removed during import:

- the process pauses
- staff can restart import

Previously imported files remain safe.

---

## No Photos Found

If a batch time range contains no photos the system displays:

```

No photos found for selected time range

```

Staff can adjust the time range.

---

## Duplicate Import Prevention

Previously imported files are automatically skipped.

---

# 10. Logging and Monitoring

The system records logs for:

- import operations
- batch creation
- file synchronization
- system errors

Logs help diagnose issues and verify operations.

---

# 11. Future Expansion Features

The system architecture supports future enhancements including:

- automatic session detection
- photographer tracking
- AI photo tagging
- automated customer notifications
- remote photo delivery
- editing workflow integration
- cloud dashboard

---

# Summary

KRA Photo Hub provides a complete feature set for:

- photo import
- photo organization
- fast customer delivery
- reliable backup
- efficient shop workflow

The system prioritizes **speed, simplicity, and operational reliability** to support the daily operations of Kimono Rental Ann.
```
