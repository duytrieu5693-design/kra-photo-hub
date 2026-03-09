```markdown
# KRA Photo Hub – Import Engine

## Overview

The Import Engine is responsible for handling all operations related to importing photos from SD cards into the local photo library.

The engine performs the following tasks:

- Detect SD card insertion
- Scan photo files
- Identify supported image formats
- Detect previously imported files
- Copy new files into the local library
- Extract EXIF metadata
- Store metadata in the database
- Report progress to the dashboard

The Import Engine is designed to be:

- fast
- safe
- idempotent (safe to run multiple times)
- resilient to interruptions

---

# Supported File Types

The Import Engine processes the following file types:

```

JPEG
JPG
RAW

```

Common RAW formats include:

```

ARW  (Sony)
CR2  (Canon)
NEF  (Nikon)

```


JPEG files are used for **customer delivery**.

RAW files are kept for:

- editing
- archive
- long-term storage

RAW files are **not delivered to customers**.

---

# Import Workflow

The Import Engine workflow consists of the following stages:

```

SD Card Detection
↓
Card Scan
↓
File Filtering
↓
Duplicate Detection
↓
Copy Files
↓
Metadata Extraction
↓
Database Insert
↓
Import Report

```

---

# 1. SD Card Detection

The system detects the presence of an SD card mounted on the server.

Possible mount examples:

```

/media/sdcard
/mnt/sdcard
D:\DCIM
E:\DCIM

```

The Import Engine identifies the root directory that contains image files.

Typical camera structure:

```

DCIM/
100MSDCF/
101MSDCF/

```

The engine recursively scans all subdirectories.

---

# 2. Card Scan

The scan operation performs a quick inventory of the card contents.

The engine collects:

- total file count
- supported photo files
- JPEG count
- RAW count
- potential duplicates

Example scan result:

```

Total Files: 642
JPEG Files: 482
RAW Files: 160
Already Imported: 494
New Files: 148

```

This information is returned to the dashboard before import begins.

---

# 3. File Filtering

Only supported photo formats are processed.

Unsupported files are ignored.

Examples of ignored files:

```

video files
thumbnail files
camera metadata files
temporary files

```

Example ignored extensions:

```

MP4
THM
TXT

```

---

# 4. Duplicate Detection

The Import Engine must prevent duplicate photo imports.

Duplicate detection is based on several checks.

### 1. File name

If a file name already exists in the database, it may be a duplicate.

Example:

```

IMG_1234.JPG

```

---

### 2. File size

Files with identical name and size are likely duplicates.

---

### 3. File hash (optional)

A hash can be computed for stronger duplicate detection.

Example algorithm:

```

MD5
SHA1

```

---

### 4. Capture timestamp

The capture time extracted from EXIF metadata can also help detect duplicates.

---

# 5. File Copy Operation

Only **new files** are copied into the local photo library.

Copy operation characteristics:

- sequential copy
- buffered file transfer
- progress tracking

Example copy speed:

```

40 MB/s – 100 MB/s

```

Destination path example:

```

photo_library/2026/03/09/

```

Example result:

```

photo_library/2026/03/09/IMG_2041.JPG

```

---

# 6. Import Directory Structure

Files are stored using a date-based directory structure.

Example:

```

photo_library/
2026/
03/
09/

```

Optional subfolder organization:

```

photo_library/
2026/
03/
09/
photographer_A/

```

Benefits:

- easy archive
- chronological navigation
- simplified backups

---

# 7. Metadata Extraction

After copying a file, the Import Engine extracts EXIF metadata.

Important EXIF fields include:

```

DateTimeOriginal
Camera Model
Lens
Image Width
Image Height

```

The most important field is:

```

DateTimeOriginal

```

This value becomes:

```

capture_time

```

in the database.

---

# 8. Database Insert

Each imported photo generates a database entry.

Example database record:

```

id: 48122
file_name: IMG_2041.JPG
file_path: photo_library/2026/03/09/IMG_2041.JPG
file_type: JPEG
capture_time: 2026-03-09 09:17:21
imported_at: 2026-03-09 10:14:12

```

This allows fast querying later.

---

# 9. Import Progress Reporting

The Import Engine reports progress to the dashboard.

Progress data includes:

```

total_files
files_copied
progress_percent
copy_speed
estimated_remaining_time

```

Example progress message:

```

Import Progress: 62%
Copied: 92 / 148 files
Speed: 45 MB/s
Estimated Time Remaining: 10 seconds

```

The dashboard polls the server periodically to update the progress display.

---

# 10. Import Completion

Once the import finishes, the engine returns a summary.

Example result:

```

Import Completed

New Files Imported: 148
JPEG: 103
RAW: 45
Skipped Files: 494

```

The result is stored in the `imports` table.

---

# Error Handling

## SD Card Removed

If the SD card is removed during import:

```

Import Interrupted

```

The system records partial progress.

When the card is reinserted, the import can resume safely.

---

## File Read Errors

If a file cannot be read:

```

File skipped

```

The error is recorded in system logs.

---

## Duplicate Detection Conflict

If a file already exists:

```

Skipped Duplicate

```

The file is not copied again.

---

# Import Engine Safety

The Import Engine guarantees:

- no duplicate imports
- safe restart after interruption
- consistent metadata storage
- reliable file organization

The system can safely scan the same SD card multiple times.

Only **new photos** will be imported.

---

# Performance Expectations

Typical performance:

| Operation | Estimated Time |
|----------|----------------|
Scan SD Card | < 2 seconds |
Import 100 photos | 10–20 seconds |
Import 500 photos | 40–60 seconds |

Performance depends on:

- SD card speed
- USB reader speed
- disk speed

---

# Future Improvements

Possible enhancements to the Import Engine include:

- automatic SD card detection
- parallel file copy
- photographer identification
- camera tracking
- automated session grouping

---

# Summary

The Import Engine is responsible for safely transferring photos from SD cards to the local photo library.

Key properties:

- fast
- reliable
- duplicate-safe
- metadata-aware

This engine is the foundation of the KRA Photo Hub workflow.
```
