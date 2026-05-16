# Feature Requirements — Upload Batch

## Goal

Define the UI for starting a new cashback batch from a manually uploaded workbook.

## Main Feature

The upload screen accepts a source workbook, captures the target period, and starts backend batch
processing.

## P0 Requirements

### 1. Upload Entry

- The user can drag and drop a file or open a file picker.
- The UI must show accepted input expectations before submission.
- The selected accounting period must be visible before upload starts.

### 2. Batch Setup

- The user must be able to select the month or period for the batch.
- The UI must communicate that this is a manual upload workflow.

### 3. Processing Handoff

- After submission, the UI must enter a processing state immediately.
- The UI must hand off to parsing and validation progress after backend acceptance.

## Non-P0 Features

- resumable uploads
- multiple files in one batch
- automatic period inference as the only workflow
