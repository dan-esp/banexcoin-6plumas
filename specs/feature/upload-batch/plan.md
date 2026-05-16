# Implementation Plan — Upload Batch

## Objective

Build the upload feature as the first operational entrypoint into the cashback workflow.

## Recommended Build Order

### 1. Upload Form

- add file dropzone
- add file picker action
- add period selector

### 2. Client-Side Feedback

- show filename and selected period
- show basic accepted and rejected states before submit

### 3. Backend Submission Flow

- submit the file and period to the private API
- handle uploading, accepted, and failed states

## Done Criteria

- an operator can create a batch from one workbook and one selected period
- the UI transitions from upload to backend processing without ambiguity
