# Manual QA

This document describes the manual test cases that should be verified before every release.

## Parent Portal

### Upload Report Card

| # | Test | Expected Result |
|---|---|---|
| 1 | Click "Upload Report" in nav | Navigates to `/parent/upload` |
| 2 | Upload an unsupported file type (.docx) | Error: "Please upload a JPG, PNG, or PDF report card." |
| 3 | Upload a file > 10 MB | Error: "Please upload a file smaller than 10MB." |
| 4 | Upload a valid JPG with no child selected | "Analyze" button is disabled |
| 5 | Upload a valid JPG, enter a new child name, click Analyze | Loading message appears; transitions from "Reading your report card..." to "Putting together your guide..." |
| 6 | Submit with a missing API key | Error banner: "Something went wrong. Please try again." (not a blank screen) |
| 7 | Successful analysis | Step 2 review screen shows editable subject grades |
| 8 | Click "Looks Correct – Save Clarity Check" | Step 3 success screen; auto-redirects to `/parent/clarity` |

### Clarity Check

| # | Test | Expected Result |
|---|---|---|
| 9 | Open Clarity Check with no report cards | Empty state shown |
| 10 | Open with a saved clarity check | Summary text, subject flags, and overall status visible |
| 11 | Click subject card | Expands AI note |

### Conversation Guide / Teacher Questions / 30-Day Plan

| # | Test | Expected Result |
|---|---|---|
| 12 | Open Conversation Guide without a clarity check | Empty state or redirect |
| 13 | Open with a saved clarity check | Script content populated |
| 14 | Mark a plan item as complete | Completion rate updates |

## Navigation

| # | Test | Expected Result |
|---|---|---|
| 15 | Click all nav items in parent portal | Each navigates to the correct route |
| 16 | Resize to mobile (< 1024px) | Mobile menu toggle appears; desktop nav hidden |
| 17 | Open mobile menu, tap a nav item | Navigates and closes the menu |
| 18 | Tap the logo | Navigates to `/parent` |

## Auth

| # | Test | Expected Result |
|---|---|---|
| 19 | Access `/parent` without logging in | Redirected to `/login` |
| 20 | Log in as teacher, try `/parent` | Redirected to `/` |
| 21 | Log out via profile menu | Session cleared; redirected to `/` |

## Teacher Portal

| # | Test | Expected Result |
|---|---|---|
| 22 | View My Classes | Lists assigned classes |
| 23 | View Class Patterns | Shows flag distribution chart |

## Admin Portal

| # | Test | Expected Result |
|---|---|---|
| 24 | Add a student via Student Roster | Student appears in list |
| 25 | Add a teacher via Teacher Management | Teacher appears in list |

## Cross-browser

Test on: Chrome (latest), Firefox (latest), Safari (latest), Edge (latest).
