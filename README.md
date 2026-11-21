# LeaseTracker AI

LeaseTracker AI is a lightweight AI-powered commercial lease management web application for small property owners and property managers.

## Problem

Commercial lease information is often spread across spreadsheets, payment records, calendars, and lease documents. That makes it difficult to monitor occupancy, rent, payments, expirations, renewals, and rent escalation in one place.

## Features

- Multi-property dashboard for the sample portfolio
- Occupancy monitoring, shown as occupied units divided by total units
- YTD Basic Rent, with VAT, CUSA, and CUSA VAT shown from the same totals
- CWT, treated as a deduction and omitted when a lease turns it off
- YTD Expected Cash, YTD Collected, YTD Outstanding, and Collection Rate
- Property filtering across the dashboard
- Lease expiration and renewal alerts, including a renewal that is already in process
- Vacant unit monitoring from each unit’s occupancy status
- Leases page with lease terms, charge settings, and rent inclusive of VAT
- Payments page with payment status, billing month, and filtered totals
- Rent-free period handling, so those payments are not treated as overdue
- AI Lease Attention classification

Financial amounts use Philippine peso formatting. Rates come from each lease. Version 1 reads static sample data and does not use a database.

## AI Capability

AI Lease Attention uses a lightweight local Naive Bayes text classifier. It classifies each lease situation as High Attention, Medium Attention, or Low Attention.

The implementation uses `wink-naive-bayes-text-classifier`. It runs locally and does not use OpenAI, Claude, or another paid AI API.

The classifier receives factual text generated from deterministic lease data, such as payment status, expiration, renewal status, and whether rent escalation is approaching. It does not generate or calculate financial figures. Rent, VAT, CWT, CUSA, expected cash, outstanding balances, occupancy, and YTD totals remain deterministic application logic.

This is AI-assisted classification, not legal advice.

## Technology

- Next.js
- TypeScript
- Tailwind CSS
- wink-naive-bayes-text-classifier
- npm
- GitHub Actions

## Sample Data

The application uses fictional, anonymized sample commercial lease data. The original Excel workbook is not included in the public repository. No real tenant personal information, banking details, tax IDs, or confidential lease documents are included.

## Running Locally

Install dependencies and start the development server:

```bash
npm install
npm run dev
```

The app is then available at [http://localhost:3000](http://localhost:3000).

## Testing

Automated unit tests cover:

- occupancy calculation
- CWT turned off
- rent escalation
- CUSA without VAT
- CUSA with VAT
- rent-free treatment
- expected cash calculation
- AI High Attention classification
- AI Medium Attention classification
- AI Low Attention classification

The current test suite has 10 automated tests.

```bash
npm test
```

Check TypeScript separately:

```bash
npx tsc --noEmit
```

## Continuous Integration

GitHub Actions runs automatically on pushes and pull requests to `main`. The workflow performs:

- `npm ci`
- `npm test`
- `npx tsc --noEmit`
- `npm run build`

## Version 1 Scope

Version 1 deliberately does not include:

- payment processing
- accounting
- invoices or statements of account
- tax filing
- automated email or SMS reminders
- a tenant portal
- authentication
- lease document analysis
- PDC management

## Disclaimer

LeaseTracker AI is a student mini-project designed for educational demonstration purposes. It is not an accounting, tax, financial, or legal advice system.

## Future Improvement

Future versions could include automated notifications, additional lease analytics, or editable lease and payment records. Those are future ideas, not current functionality.
