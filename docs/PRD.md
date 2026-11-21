**LeaseTracker AI**

**Product Requirements Document (PRD)**

**Product Overview**

LeaseTracker AI is a simple commercial lease management web application for small property owners and property managers.

The application provides one place to monitor properties, units, leases, rent, payments, occupancy, lease expirations, renewals, and year-to-date rental information.

A lightweight AI feature helps identify leases that may require attention.

---

**Target User**

The primary user is a small commercial property owner or property manager responsible for multiple commercial units and leases.

---

**Problem**

Commercial lease information is often maintained using spreadsheets, payment records, calendars, and individual lease documents.

This can make it difficult to quickly determine:

- property occupancy;
- rent due and collected;
- outstanding rent;
- upcoming lease expirations;
- pending renewals; and
- upcoming rent escalations.

---

**Product Goal**

LeaseTracker AI will provide a simple dashboard that gives the user a clear view of the current status of the commercial lease portfolio.

The application should be simple enough for routine lease monitoring without becoming a full accounting or property-management system.

---

**Core Features**

**Properties and Units**

The application will:

- support multiple properties;
- record commercial units under each property;
- identify units as occupied or vacant; and
- calculate occupancy rate.

**Lease Tracking**

Each lease may include:

- tenant;
- property and unit;
- lease start date;
- lease expiration date;
- renewal status;
- basic monthly rent;
- rent due date;
- VAT applicability and rate;
- CWT applicability and rate;
- CUSA applicability;
- CUSA VAT applicability and rate;
- rent escalation applicability and rate; and
- rent-free periods.

**Payment Tracking**

The application will record monthly rent information including:

- amount due;
- amount paid;
- payment date; and
- payment status.

Payment statuses may include:

- Paid;
- Partially Paid;
- Unpaid; and
- Rent Free.

**Dashboard**

The dashboard will display:

- occupancy rate;
- occupied and vacant units;
- YTD basic rent;
- YTD VAT;
- YTD CUSA;
- YTD CWT;
- YTD expected cash collection;
- YTD amount collected;
- YTD outstanding amount;
- collection rate;
- breakdown by property;
- overdue rent alerts;
- upcoming lease expirations;
- pending renewals; and
- upcoming rent escalations.

**AI Feature**

The application will include a lightweight AI feature that identifies leases that may require attention.

The AI feature will classify leases into simple attention categories such as:

- High Attention;
- Medium Attention; and
- Low Attention.

The AI feature will use lease information such as payment status, lease expiration, renewal status, and upcoming rent escalation.

---

**Data**

The application will use anonymized sample commercial lease data.

The initial dataset will contain:

- properties;
- units;
- leases; and
- monthly payment records.

No confidential tenant information, banking information, tax identification numbers, or signed lease documents will be included.

---

**Version 1 Scope**

Version 1 will focus only on essential commercial lease monitoring.

The following are outside the scope of Version 1:

- accounting;
- invoice or statement generation;
- payment processing;
- tenant portal;
- automated email or SMS reminders;
- tax filing;
- PDC management;
- document storage;
- lease-document extraction; and
- multi-user permissions.

These may be considered as future improvements.

---

**Success Criteria**

LeaseTracker AI will be considered successful when:

1. Properties, units, leases, and payments can be viewed in the web app.
2. Occupancy is calculated correctly.
3. Monthly and YTD rental amounts are calculated correctly.
4. VAT, CWT, CUSA, and rent escalation settings are respected.
5. Rent-free periods are handled correctly.
6. Overdue rent and lease expiration alerts are displayed.
7. Property-level and portfolio-level summaries are available.
8. The AI capability successfully provides a lease-attention classification.
9. At least three automated unit tests pass.
10. The application is deployed to a working public URL.

 
