# Subscriptions

This document describes the subscription model for NextStep·AI schools.

## Plans (Planned)

| Plan | Price | Seats | Features |
|---|---|---|---|
| **Free** | ₹0 | 1 parent | Upload up to 2 report cards/month, basic Clarity Check |
| **Family** | ₹199/mo | 1 parent, unlimited children | Unlimited uploads, all features |
| **School Pro** | ₹4,999/mo | Up to 500 parents | All Family features + teacher portal + admin portal + class patterns |
| **School Enterprise** | Custom | Unlimited | All Pro features + dedicated support + custom integrations |

## MVP Status

In the MVP, the Subscription page (`/admin/subscription`) is a UI placeholder only. No payment processing is implemented. The page shows:
- Current plan: "Free Trial"
- A prominent "Upgrade" CTA (no action on click yet)
- Seat usage: `{parentCount} / {planLimit}`

## Planned Implementation (v2.0.0+)

- Integrate Stripe for payment processing
- Webhook to update subscription status in Supabase
- Row Level Security to gate features by plan
- Vercel serverless function to create Stripe checkout sessions

## Feature Gating (Planned)

| Feature | Free | Family | School Pro |
|---|---|---|---|
| Upload report cards | ✅ (2/mo) | ✅ unlimited | ✅ unlimited |
| Clarity Check | ✅ | ✅ | ✅ |
| Conversation Guide | ✅ | ✅ | ✅ |
| Teacher Questions | ❌ | ✅ | ✅ |
| 30-Day Plan | ❌ | ✅ | ✅ |
| Teacher Portal | ❌ | ❌ | ✅ |
| Admin Portal | ❌ | ❌ | ✅ |
| Class Patterns | ❌ | ❌ | ✅ |

## Storage Key

`nextstep_subscription` — stores `{ plan: string; seatsUsed: number; renewalDate: string }`.
