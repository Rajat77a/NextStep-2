# Privacy Notes

## Core Privacy Principle

**A parent's data is their own.** No teacher, school admin, or other parent can read a parent's Clarity Check, conversation guide, 30-day plan, or uploaded report cards.

## What Each Role Can See

| Data | Parent | Teacher | Admin |
|---|---|---|---|
| Their own Clarity Checks | ✅ | ❌ | ❌ |
| Their own uploaded report cards | ✅ | ❌ | ❌ |
| Their own conversation scripts | ✅ | ❌ | ❌ |
| Their own 30-day plan | ✅ | ❌ | ❌ |
| Class-level flag aggregates | ❌ | ✅ | ✅ |
| Student name and class | ❌ | ✅ | ✅ |
| Individual student flag breakdown | ❌ | ✅ | ✅ |

## Data Storage

All data is stored in the **user's browser localStorage** (MVP). Nothing is sent to a server except:

1. **OCR:** Report card image bytes are processed in-browser by Tesseract.js (WebAssembly). No image data leaves the device.
2. **AI analysis:** The extracted text (not the image) is sent to the Anthropic (Claude) API. This is the only data that leaves the browser.

## What Is Sent to Claude

The prompt includes:
- Extracted OCR text from the report card
- Child's first name
- Board type (CBSE / ICSE / etc.)

It does **not** include:
- Parent's name or email
- School name or location
- Any other personally identifiable information beyond the child's first name

## Planned Changes for v2.0.0

When the backend migrates to Supabase:
- Row Level Security (RLS) policies will enforce data isolation at the database level.
- Uploaded report card images will be stored in a private Supabase Storage bucket, accessible only to the uploading parent.
- AI calls will move server-side, removing the API key from the client bundle.

## Data Deletion

Currently (MVP): users can clear their data by clearing localStorage in browser DevTools.

v2.0.0 will provide an in-app "Delete my account and data" option.
