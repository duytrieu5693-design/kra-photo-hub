```markdown
# KRA Photo Hub – Batch Engine

## Overview

The Batch Engine is responsible for grouping imported photos into **customer sessions (batches)**.

A **batch** represents the photos taken during a single photoshoot session for one customer or group.

The Batch Engine allows staff to:

- select photos based on time range
- preview selected photos
- create a batch record
- generate ZIP packages
- generate QR download links
- manage batch history

The Batch Engine works on top of the **photo metadata stored in the database**.

---

# Batch Concept

A **batch** is defined by a time range:

```

start_time → end_time

```

All photos where:

```

capture_time BETWEEN start_time AND end_time

```

are included in the batch.

Example:

```

Customer Session
Start: 09:05
End: 10:05

```

Photos in this time range belong to the same customer.

---

# Batch Workflow

The Batch Engine workflow:

```

Select Time Range
↓
Search Photos
↓
Preview Selection
↓
Create Batch
↓
Store Batch Record
↓
Generate ZIP
↓
Generate QR Code
↓
Deliver to Customer

```

---

# 1. Photo Search

When staff creates a batch, the engine queries the database for photos.

Example query logic:

```

SELECT *
FROM photos
WHERE capture_time BETWEEN start_time AND end_time
AND file_type = 'JPEG'
ORDER BY capture_time ASC

```

RAW files are ignored for delivery.

Only **JPEG photos** are included in batches.

---

# 2. Batch Preview

Before confirming a batch, the system shows a preview.

Preview information includes:

```

Total photos found
First photo name
Last photo name
Capture time range

```

Example preview:

```

Photos Found: 48
First Photo: IMG_1021.JPG
Last Photo: IMG_1068.JPG
Time Range: 09:07 – 10:01

```

This allows staff to verify that the correct photos are selected.

---

# 3. Batch Creation

Once confirmed, the Batch Engine creates a new batch.

Example batch ID format:

```

batch-YYYY-MM-DD-HHMM

```

Example:

```

batch-2026-03-09-0905

```

Batch record fields:

```

batch_id
start_time
end_time
photo_count
created_at
delivery_status

```

A new record is inserted into the `batches` table.

---

# 4. Batch Photo Mapping

Each photo included in the batch is recorded in the `batch_photos` table.

Example:

```

## batch_photos

batch_id
photo_id

```

Relationship:

```

batches → batch_photos → photos

```

This mapping allows the system to:

- retrieve photos quickly
- regenerate ZIP files if needed
- display batch previews

---

# 5. Batch Storage

A temporary folder may be created for batch processing.

Example:

```

storage/batches/batch-2026-03-09-0905/

```

This folder can contain:

```

temporary file lists
processing metadata
ZIP preparation files

```

Actual photos remain stored in the main photo library.

---

# 6. ZIP Generation

After batch creation, the system generates a ZIP archive containing JPEG photos.

Example output:

```

exports/batch-2026-03-09-0905.zip

```

ZIP creation steps:

```

Collect JPEG file paths
↓
Copy into temporary ZIP stream
↓
Compress files
↓
Save ZIP archive

```

RAW files are excluded.

---

# 7. Download URL Generation

After ZIP generation, the system creates a download URL.

Example:

```

/download/batch-2026-03-09-0905

```

Full example:

```

[http://192.168.1.50:3000/download/batch-2026-03-09-0905](http://192.168.1.50:3000/download/batch-2026-03-09-0905)

```

This link allows customers to download their photos.

---

# 8. QR Code Generation

The Batch Engine generates a QR code for the download link.

The QR code is displayed on the dashboard.

Customers can scan the code using:

```

iPhone
Android

```

The QR code opens the download page in the customer's browser.

---

# 9. Batch History

All batches are stored in the database and can be accessed through batch history.

Example batch list:

```

Recent Sessions

09:05 Session – 48 photos – Delivered
11:37 Session – 52 photos – Pending
14:10 Session – 60 photos – Delivered

```

Staff can reopen any batch to:

```

view photos
regenerate QR code
copy download link
recreate ZIP file

```

---

# 10. Delivery Status

Each batch tracks delivery status.

Possible values:

```

pending
ready
delivered

```

Example workflow:

```

Batch Created → pending
ZIP Generated → ready
Customer Downloaded → delivered

```

Delivery status helps staff track customer deliveries.

---

# 11. Batch Deletion (Optional)

In some cases, staff may want to delete a batch.

Possible reasons:

```

wrong time range
incorrect photos
duplicate batch

```

Deleting a batch removes:

```

batch record
batch_photos entries
ZIP file

```

Photos remain stored in the library.

---

# Error Handling

## No Photos Found

If no photos match the selected time range:

```

No photos found for selected time range

```

Staff can adjust start or end time.

---

## ZIP Generation Failure

If ZIP creation fails:

```

ZIP generation failed

```

The system logs the error and allows retry.

---

## Batch Already Exists

If a batch with the same ID exists:

```

Batch already exists

```

The system may:

```

append suffix
or reject creation

```

Example:

```

batch-2026-03-09-0905-2

```

---

# Performance Expectations

Typical performance:

| Operation | Time |
|----------|------|
Batch search | < 1 second |
Batch creation | < 1 second |
ZIP generation (50 photos) | 3–5 seconds |

Performance depends mainly on disk speed.

---

# Future Enhancements

Possible future improvements include:

```

automatic session detection
AI-based grouping
photographer tagging
auto-batch creation
customer name tagging

```

These features can further automate the workflow.

---

# Summary

The Batch Engine converts imported photos into **customer-ready photo packages**.

Key capabilities:

```

time-based photo grouping
fast batch creation
ZIP generation
QR code delivery
batch history management

```

The Batch Engine enables **fast in-shop photo delivery**, which is the core value of KRA Photo Hub.
```
