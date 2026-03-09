```markdown
# KRA Photo Hub – User Workflow

## Overview

This document describes how staff at Kimono Rental Ann use **KRA Photo Hub** during daily operations.

The workflow is designed to be:

- fast
- simple
- reliable
- suitable for non-technical staff

The system allows photos to be delivered to customers within minutes after a photoshoot.

---

# Main Workflow Stages

The complete workflow consists of the following stages:

1. Insert SD card
2. Scan photo files
3. Import new photos
4. Create customer batch
5. Preview photos
6. Generate ZIP package
7. Generate QR code
8. Deliver photos to customer

---

# Daily Workflow

## Step 1 – Photographer Finishes Photoshoot

After finishing a photoshoot session, the photographer removes the **SD card** from the camera.

The SD card contains:

- JPEG photos (customer delivery)
- RAW photos (editing and archive)

The SD card is brought back to the shop.

---

## Step 2 – Insert SD Card into Local Server

A staff member inserts the SD card into the **SD card reader connected to the local server computer**.

The server machine may be:

- Windows laptop
- Mini PC
- Mac Mini

Once the card is inserted, the system can begin scanning files.

---

# Import Workflow

## Step 3 – Scan Card

On the **iPad dashboard**, the staff presses:

```

Scan Card

```

The system performs the following operations:

1. Detect SD card
2. Scan all files
3. Identify supported photo formats
4. Detect previously imported files
5. Count new files

The dashboard displays:

```

Total Files
JPEG Files
RAW Files
Already Imported
New Files

```

Example display:

```

Total Files: 642
JPEG Files: 482
RAW Files: 160
New Files: 148

```

---

## Step 4 – Import New Files

The staff presses:

```

Import New Files

```

The server begins copying files from the SD card to the **local photo library**.

During the import process, the dashboard shows a progress indicator.

Example display:

```

Importing Photos...

Progress: 62%

Copied: 92 / 148 files
Speed: 45 MB/s
Estimated Time Remaining: 10 seconds

```

Only **new files** are copied.

Previously imported photos are automatically skipped.

---

## Step 5 – Import Completed

Once the import process finishes, the dashboard shows:

```

Import Completed

New Files Imported: 148
JPEG: 103
RAW: 45

```

All photos are now stored inside the **local photo library**.

---

# Creating Customer Batches

## Step 6 – Create Batch

To deliver photos to a specific customer, staff creates a **batch**.

A batch represents the photos taken during one photoshoot session.

On the dashboard, staff presses:

```

Create Customer Batch

```

The interface allows staff to input:

```

Start Time
End Time

```

Example:

```

Start Time: 09:05
End Time: 10:05

```

---

## Step 7 – Photo Filtering

The system filters photos using:

```

capture_time between start_time and end_time

```

All JPEG photos taken during that time period are selected.

The dashboard shows a preview:

```

Photos Found: 48
First Photo: IMG_1021.JPG
Last Photo: IMG_1068.JPG

```

Staff can confirm if the selection looks correct.

---

## Step 8 – Confirm Batch

If the selection is correct, staff presses:

```

Create Batch

```

The system stores the batch in the database and prepares the photos for delivery.

---

# Preparing Photo Delivery

## Step 9 – Generate ZIP Package

After the batch is created, the system automatically:

1. Collects all JPEG files in the batch
2. Creates a ZIP archive

Example file:

```

batch-2026-03-09-0905.zip

```

The ZIP file is stored in the export directory.

---

## Step 10 – Generate QR Code

Once the ZIP file is created, the server generates a **download link**.

Example:

```

[http://192.168.1.50:3000/download/batch-2026-03-09-0905](http://192.168.1.50:3000/download/batch-2026-03-09-0905)

```

A QR code is generated for this link.

The QR code appears on the dashboard.

---

# Customer Photo Delivery

## Step 11 – Customer Scans QR Code

The staff shows the QR code to the customer.

The customer scans the code using their phone.

Supported devices:

- iPhone
- Android

The customer opens the link in their browser.

---

## Step 12 – Customer Downloads Photos

The download page displays:

```

Download Photos
Batch: 2026-03-09 09:05 Session
Photos: 48 JPEG files

```

The customer downloads the ZIP file.

After download:

- iPhone users can save photos to Photos
- Android users can extract and view photos

---

# Alternative Delivery

If the customer leaves before receiving photos, staff can send the download link later.

Possible methods:

- WhatsApp
- WeChat
- Facebook Messenger
- Instagram DM
- Google Drive link

---

# Batch History

The dashboard maintains a **batch history list**.

Example display:

```

Recent Sessions

09:05 Session – 48 photos – Delivered
11:37 Session – 52 photos – Pending
14:10 Session – 60 photos – Delivered

```

Staff can reopen any batch to:

- regenerate QR code
- copy download link
- resend photos

---

# NAS Backup Workflow

After import, photos are also synchronized to NAS storage.

Purpose:

- long-term archive
- data backup
- editing workflow

NAS synchronization runs in the background.

This process does not affect the delivery workflow.

---

# Error Handling

The system handles several possible issues:

## Duplicate Photos

If photos already exist in the library:

```

Already Imported

```

The system skips them automatically.

---

## SD Card Removed

If the SD card is removed during import:

```

Import Interrupted

```

The staff can restart the import process.

Already imported files will not be duplicated.

---

## No Photos Found

If no photos match the batch time:

```

No photos found for selected time range

```

Staff can adjust the start or end time.

---

# Summary

The daily workflow of KRA Photo Hub is designed to be:

- quick
- intuitive
- reliable
- optimized for in-shop photo delivery

Typical time to deliver photos after a photoshoot:

```

1–2 minutes

```

This allows Kimono Rental Ann to provide a smooth customer experience while keeping operations efficient.
```
