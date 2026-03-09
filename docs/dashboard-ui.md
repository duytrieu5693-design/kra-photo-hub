```markdown
# KRA Photo Hub – Dashboard UI Specification

## Overview

The Dashboard UI is the **primary control interface** used by staff to operate the KRA Photo Hub system.

The dashboard runs as a **web application served by the local server** and is typically accessed from an **iPad inside the shop**.

Example access URL:

```

[http://192.168.1.50:3000](http://192.168.1.50:3000)

```

Design goals:

- extremely simple interface
- optimized for touch interaction
- fast response
- minimal training required
- real-time system feedback

The dashboard acts as a **control panel for the photo server**.

---

# UI Design Principles

The interface follows these principles:

```

Large buttons
Minimal text
Clear workflow
Fast operations
Touch-friendly layout

```

Primary users:

```

shop staff
photographers
assistants

```

The UI must allow staff to complete photo delivery in **less than 1 minute**.

---

# Main Dashboard Screens

The dashboard contains the following main screens:

```

Home Screen
Import Screen
Batch Creation Screen
Batch History Screen
Delivery Screen
System Status Screen

```

Each screen supports a specific stage of the workflow.

---

# 1. Home Screen

The Home Screen is the **main control panel**.

It provides quick access to the most important actions.

## Layout

```

---

KRA Photo Hub

[ Scan Card ]

[ Import Photos ]

[ Create Batch ]

[ Batch History ]

---

## Recent Activity

Import Completed – 148 photos
Batch Created – 09:05 session
Delivery Completed – 48 photos

```

## Main Buttons

### Scan Card

Detects SD card and scans photo files.

```

Scan Card

```

Triggers:

```

POST /api/card/scan

```

---

### Import Photos

Starts importing new photos from SD card.

```

Import Photos

```

Triggers:

```

POST /api/import/start

```

---

### Create Batch

Opens batch creation screen.

```

Create Batch

```

---

### Batch History

Shows previous photo sessions.

```

Batch History

```

---

# 2. Import Screen

The Import Screen shows **real-time import progress**.

## Layout

```

---

Importing Photos

Progress: 62%

[ Progress Bar ]

Copied: 92 / 148 files
Speed: 45 MB/s

Estimated Time Remaining:
10 seconds

---

[ Cancel Import ]

```

## Features

Displays:

```

total files
files copied
copy speed
progress percentage
estimated time remaining

```

The screen updates automatically by polling:

```

GET /api/import/progress

```

---

# 3. Batch Creation Screen

This screen allows staff to create a customer batch using **time range selection**.

## Layout

```

---

Create Customer Batch

Start Time
[ 09:05 ]

End Time
[ 10:05 ]

---

[ Search Photos ]

---

Photos Found: 48

First Photo: IMG_1021.JPG
Last Photo: IMG_1068.JPG

---

[ Create Batch ]

```

## Workflow

1. Enter start time
2. Enter end time
3. Press **Search Photos**
4. Preview results
5. Press **Create Batch**

API used:

```

POST /api/photos/search
POST /api/batch/create

```

---

# 4. Batch Preview Screen

After searching photos, a preview is displayed.

## Layout

```

---

Batch Preview

Photos Found: 48

Time Range:
09:07 – 10:01

---

Preview Images

IMG_1021.JPG
IMG_1022.JPG
IMG_1023.JPG
...

---

[ Confirm Batch ]
[ Cancel ]

```

The preview ensures staff selected the correct session.

---

# 5. Delivery Screen

After batch creation, the system prepares photo delivery.

## Layout

```

---

Customer Photo Delivery

Batch:
09:05 Session

Photos:
48 JPEG files

---

[ Generate ZIP ]

---

ZIP Ready

[ QR CODE ]

---

Download Link

[http://192.168.1.50:3000/download/batch-2026-03-09-0905](http://192.168.1.50:3000/download/batch-2026-03-09-0905)

---

[ Copy Link ]
[ Regenerate QR ]

```

Customers can scan the QR code directly.

---

# 6. Batch History Screen

This screen shows all previously created batches.

## Layout

```

---

Batch History

09:05 Session
48 photos
Status: Delivered

[ Open ]

---

11:37 Session
52 photos
Status: Ready

[ Open ]

---

14:10 Session
60 photos
Status: Pending

[ Open ]

```

## Features

Staff can:

```

reopen batch
regenerate QR code
copy download link
recreate ZIP

```

API used:

```

GET /api/batch/list
GET /api/batch/{batch_id}

```

---

# 7. Batch Details Screen

Displays detailed information for a batch.

## Layout

```

---

Batch Details

Batch ID
batch-2026-03-09-0905

Photos
48

Created At
10:15

Delivery Status
Ready

---

[ Show QR Code ]

[ Copy Download Link ]

[ Regenerate ZIP ]

```

---

# 8. System Status Screen

Displays system health information.

## Layout

```

---

System Status

Server Running
YES

SD Card Inserted
YES

NAS Connected
YES

Import Running
NO

---

Storage Usage

Photo Library
245 GB

Available Space
1.2 TB

```

API used:

```

GET /api/system/status

```

---

# Mobile Compatibility

The dashboard must support:

```

iPad (primary device)
iPhone
Laptop browsers

```

Responsive design ensures proper layout.

Touch elements must be:

```

minimum 44px height
large tap targets
clear visual feedback

```

---

# Error Messages

The UI should display clear messages for errors.

Examples:

```

No SD Card Detected

```
```

Import Failed

```
```

No Photos Found in Selected Time Range

```

Errors should always provide **simple instructions**.

---

# Future UI Enhancements

Possible improvements:

```

photo thumbnails in preview
drag-to-adjust time range
auto-detect sessions
photographer tagging
customer name tagging
live import notifications

```

---

# Summary

The KRA Photo Hub Dashboard UI is designed to provide:

```

simple operation
fast batch creation
instant photo delivery
clear system feedback
touch-friendly controls

```

The dashboard allows staff to complete the full workflow:

```

Scan Card
→ Import Photos
→ Create Batch
→ Generate QR
→ Deliver Photos

```

in less than one minute.
```
