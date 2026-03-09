```markdown
# KRA Photo Hub – Database Schema

## Overview

KRA Photo Hub uses **SQLite** as the primary local database.

The database stores:

- photo metadata
- batch information
- delivery status
- import history
- system logs

Actual photo files are **not stored in the database**.  
The database only stores **file paths and metadata references**.

Database file location example:

```

storage/database/kra-photo-hub.db

```

SQLite is chosen because:

- lightweight
- reliable
- no server required
- perfect for local systems

---

# Database Tables

The system uses the following main tables:

```

photos
batches
batch_photos
imports
system_logs

```

---

# 1. photos Table

Stores metadata for every imported photo.

## Purpose

- track imported photos
- store capture time
- detect duplicates
- support batch creation

## Table Structure

```

photos

```

| Column | Type | Description |
|------|------|-------------|
| id | INTEGER PRIMARY KEY | Unique photo ID |
| file_name | TEXT | Original file name |
| file_path | TEXT | Absolute path to photo file |
| file_type | TEXT | JPEG or RAW |
| file_size | INTEGER | File size in bytes |
| capture_time | DATETIME | Timestamp from EXIF metadata |
| camera_model | TEXT | Camera model (optional) |
| lens | TEXT | Lens model (optional) |
| file_hash | TEXT | File hash used for duplicate detection |
| imported_at | DATETIME | Time when photo was imported |

---

# 2. batches Table

Stores information about customer photo batches.

A batch represents **one photoshoot session for a customer**.

## Table Structure

```

batches

```

| Column | Type | Description |
|------|------|-------------|
| id | TEXT PRIMARY KEY | Batch ID |
| start_time | DATETIME | Start of photoshoot session |
| end_time | DATETIME | End of photoshoot session |
| photo_count | INTEGER | Number of photos in batch |
| zip_path | TEXT | Path to generated ZIP file |
| download_url | TEXT | Download link for customer |
| delivery_status | TEXT | pending / ready / delivered |
| created_at | DATETIME | Batch creation time |

Example batch ID:

```

batch-2026-03-09-0905

```

---

# 3. batch_photos Table

This table connects photos to batches.

A batch contains **many photos**.

## Table Structure

```

batch_photos

```

| Column | Type | Description |
|------|------|-------------|
| id | INTEGER PRIMARY KEY |
| batch_id | TEXT | Reference to batches.id |
| photo_id | INTEGER | Reference to photos.id |

Relationship:

```

batches (1) → batch_photos (many) → photos

```

---

# 4. imports Table

Tracks import sessions from SD cards.

This table helps track history and debug issues.

## Table Structure

```

imports

```

| Column | Type | Description |
|------|------|-------------|
| id | INTEGER PRIMARY KEY |
| source_path | TEXT | SD card mount path |
| total_files | INTEGER | Total scanned files |
| new_files | INTEGER | Newly imported files |
| skipped_files | INTEGER | Duplicate files skipped |
| started_at | DATETIME | Import start time |
| completed_at | DATETIME | Import completion time |

---

# 5. system_logs Table

Stores system events and errors.

Used for troubleshooting and monitoring.

## Table Structure

```

system_logs

```

| Column | Type | Description |
|------|------|-------------|
| id | INTEGER PRIMARY KEY |
| log_time | DATETIME | Timestamp |
| log_level | TEXT | info / warning / error |
| event_type | TEXT | event category |
| message | TEXT | Log message |

Example log:

```

import_completed
148 photos imported successfully

```

---

# Indexes

Indexes are created to improve query performance.

## Capture Time Index

```

CREATE INDEX idx_photos_capture_time
ON photos(capture_time);

```

This index allows fast filtering when creating batches.

---

## Batch Lookup Index

```

CREATE INDEX idx_batch_photos_batch
ON batch_photos(batch_id);

```

Improves performance when retrieving batch photos.

---

# Data Relationships

Relationship diagram:

```

photos
│
│ photo_id
▼
batch_photos
│
│ batch_id
▼
batches

```

Additional independent tables:

```

imports
system_logs

```

---

# Typical Database Operations

## Import Photo

Insert into:

```

photos

```

---

## Create Batch

Insert into:

```

batches

```

Then populate:

```

batch_photos

```

---

## Generate ZIP

Update:

```

batches.zip_path

```

---

## Customer Download

Update:

```

batches.delivery_status

```

---

# Data Volume Expectations

Typical usage per day:

| Data | Estimated Count |
|----|----|
| Photos | 500–2000 |
| Batches | 10–30 |
| Imports | 2–6 |

SQLite can easily handle this workload.

---

# Backup Strategy

The database file is backed up through:

- NAS synchronization
- optional cloud backup

Database file size is expected to remain small.

Typical size after one year:

```

< 100 MB

```

---

# Future Schema Expansion

Future database tables may include:

```

photographers
sessions
editing_jobs
customer_records
delivery_history

```

These additions will allow:

- photographer tracking
- editing workflows
- customer history

---

# Summary

The KRA Photo Hub database schema is designed to be:

- simple
- efficient
- scalable
- easy to maintain

SQLite ensures the system remains lightweight while supporting all operational requirements of the shop.
```
