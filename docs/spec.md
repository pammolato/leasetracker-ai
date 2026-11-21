**LeaseTracker AI**

**Application Specification**

**1. Purpose**

Build a simple AI-powered commercial lease management web application called LeaseTracker AI.

The application is intended for a small commercial property owner or property manager.

Version 1 must remain simple and suitable for a student mini-project.

---

**2. Main Navigation**

The application should have three main pages:

1. Dashboard
2. Leases
3. Payments

Do not add additional pages unless necessary.

---

**3. Sample Data**

Use anonymized sample data based on the project's Excel workbook.

The data consists of:

- Properties
- Units
- Leases
- Payments

Data relationships:

Property → Unit → Lease → Payment

Do not include real tenant names, personal information, banking information, tax identification numbers, or confidential documents.

For Version 1, the application may use static local sample data.

A database is not required.

---

**4. Dashboard**

Create a simple dashboard.

Provide filters for:

- Property
- Year

The default property filter should be:

All Properties

The dashboard should display summary cards for:

- Occupancy Rate
- YTD Basic Rent
- YTD Expected Cash
- YTD Collected
- YTD Outstanding
- YTD Collection Rate

**YTD Rent Breakdown**

Display:

- Basic Rent
- VAT
- Basic CUSA
- CUSA VAT
- Gross Charges
- CWT
- Expected Cash
- Amount Collected
- Outstanding

The totals should change when the user filters by property.

**Property Breakdown**

Display a simple table containing:

- Property
- Occupancy
- YTD Basic Rent
- YTD Expected Cash
- YTD Collected
- YTD Outstanding

**Payment Alerts**

Display:

- overdue rent;
- rent due soon; and
- partially paid rent.

**Lease Alerts**

Display:

- leases approaching expiration;
- expired leases with renewal pending; and
- upcoming rent escalations.

**Vacancies**

Display currently vacant commercial units.

---

**5. Properties and Units**

Each property should contain:

- Property ID
- Property Name
- Address
- Units

Each unit should contain:

- Unit ID
- Unit name or number
- Floor area
- Occupancy status

Occupancy status should be:

- Occupied
- Vacant

Calculate occupancy as:

occupied units / total units × 100

Do not calculate occupancy by averaging property percentages.

---

**6. Lease Information**

Each lease may contain:

- Lease ID
- Property
- Unit
- Tenant
- Lease Start Date
- Lease Expiration Date
- Basic Monthly Rent
- Rent Due Day
- Renewal Status
- Lease Status
- Security Deposit

---

**7. VAT**

VAT must be configurable per lease.

Fields:

- VAT Applicable: Yes / No
- VAT Rate

If VAT Applicable = No:

VAT = 0

If VAT Applicable = Yes:

calculate VAT using the configured VAT rate.

Do not hardcode the VAT rate.

---

**8. CWT**

CWT must be configurable per lease.

Fields:

- CWT Applicable: Yes / No
- CWT Rate

If CWT Applicable = No:

CWT = 0

If CWT Applicable = Yes:

calculate CWT using the configured CWT rate.

Do not hardcode the CWT rate.

Treat CWT as a deduction when calculating expected cash.

---

**9. CUSA**

CUSA must be configurable per lease.

Fields:

- CUSA Applicable: Yes / No
- CUSA VAT Applicable: Yes / No
- CUSA VAT Rate
- Monthly CUSA Amount

If CUSA Applicable = No:

Basic CUSA = 0 CUSA VAT = 0

If CUSA Applicable = Yes and CUSA VAT Applicable = No:

Basic CUSA = Monthly CUSA Amount CUSA VAT = 0

If CUSA Applicable = Yes and CUSA VAT Applicable = Yes:

treat Monthly CUSA Amount as VAT-inclusive.

Calculate:

Basic CUSA = Monthly CUSA Amount / (1 + CUSA VAT Rate)

CUSA VAT = Monthly CUSA Amount - Basic CUSA

Do not hardcode the CUSA VAT rate.

---

**10. Expected Cash**

Calculate:

Gross Charges = Basic Rent

- Rent VAT
- Basic CUSA
- CUSA VAT

Expected Cash = Gross Charges

- CWT

Do not use AI to perform financial calculations.

---

**11. Rent Escalation**

Rent escalation must be configurable per lease.

Fields:

- Escalation Applicable: Yes / No
- Escalation Rate
- Escalation Effective Date
- Escalation Frequency

If escalation is off:

keep the basic rent unchanged.

If escalation is on:

calculate the new basic rent using the configured escalation rate.

Example:

Basic Rent = 100,000 Escalation = 5%

New Basic Rent = 105,000

YTD calculations must use the rent actually applicable during each billing month.

---

**12. Rent-Free Periods**

Payment status may be:

- Paid
- Partially Paid
- Unpaid
- Rent Free

A rent-free month must still appear in the payment history.

For a fully rent-free month:

Basic Rent = 0 Rent VAT = 0 CWT = 0

Do not classify the month as overdue.

If CUSA remains payable during a rent-free period, CUSA and applicable CUSA VAT may still be charged.

---

**13. Payments**

The Payments page should show:

- Payment ID
- Lease ID
- Tenant
- Property
- Billing Month
- Due Date
- Basic Rent Due
- VAT Due
- Basic CUSA Due
- CUSA VAT Due
- CWT Deduction
- Expected Cash
- Amount Paid
- Payment Date
- Payment Status

Use clear Philippine peso formatting.

Example:

₱100,000.00

---

**14. YTD Calculations**

YTD calculations should use payment records from January 1 through the selected reporting date/year.

Calculate:

- YTD Basic Rent
- YTD VAT
- YTD Basic CUSA
- YTD CUSA VAT
- YTD CWT
- YTD Expected Cash
- YTD Collected
- YTD Outstanding

Collection Rate =

YTD Collected / YTD Expected Cash × 100

Handle division by zero safely.

---

**15. Alerts**

Use normal deterministic application logic for alerts.

Suggested classifications:

**Payment**

Paid → Paid

Unpaid and past due → Overdue

Unpaid and due within 7 days → Due Soon

Partially Paid → Partially Paid

Rent Free → Rent Free

**Lease Expiration**

90 days or less → Expiring Soon

91–180 days → Upcoming

More than 180 days → Active

Expired + Renewal Pending → Renewal in Process

---

**16. AI Feature**

Include one small AI capability.

Name:

AI Lease Attention

The AI component should classify lease situations into:

- High Attention
- Medium Attention
- Low Attention

It may consider:

- overdue payment information;
- lease expiration;
- renewal status; and
- upcoming rent escalation.

Use a free local or open-source AI approach.

Do not require a paid OpenAI or Claude API.

Do not allow the AI model to calculate:

- VAT;
- CWT;
- CUSA;
- rent;
- expected cash;
- outstanding balances; or
- YTD totals.

Those calculations must use normal application code.

---

**17. Testing**

Create at least three automated unit tests.

Required tests:

**Test 1: Occupancy**

8 occupied units out of 10

Expected result:

80%

**Test 2: CWT Off**

If CWT Applicable = No:

Expected CWT = 0

**Test 3: Rent Escalation**

Basic Rent = 100,000 Escalation = 5%

Expected result:

105,000

Additional useful tests:

- CUSA without VAT
- CUSA with VAT
- Rent-free month
- Overdue payment
- Expected cash calculation

---

**18. User Interface**

Keep the UI clean and simple.

Use:

- clear summary cards;
- simple tables;
- green for normal/paid;
- amber for attention;
- red for overdue/high attention;
- consistent Philippine peso formatting.

The interface should work on normal desktop and mobile browser sizes.

Do not build complicated charts unless there is time after all required assignment deliverables are complete.

---

**19. Security**

- Do not hardcode secrets.
- Do not include real tenant information.
- Validate user inputs.
- Do not process actual payments.
- Do not include confidential lease documents.
- Do not expose API keys.

---

**20. Version 1 Exclusions**

Do NOT build:

- payment processing;
- accounting;
- invoice generation;
- statement of account generation;
- tax filing;
- CWT certificates;
- PDC tracking;
- automated email reminders;
- automated SMS reminders;
- tenant portal;
- user authentication;
- document management;
- lease PDF analysis;
- multiple user roles.

These are outside Version 1.

---

**21. Completion Criteria**

Version 1 is complete when:

1. The Dashboard works.
2. Lease information can be viewed.
3. Payment information can be viewed.
4. Property filtering works.
5. YTD calculations work.
6. VAT, CWT and CUSA settings are respected.
7. Rent-free periods work.
8. Escalation logic works.
9. Alerts work.
10. The AI Lease Attention feature works.
11. At least three unit tests pass.
12. GitHub Actions successfully runs the tests.
13. The application is available through a live public URL.

**22. Specification Review and Revision**

The specification was reviewed before development.

The following decisions were confirmed during the review:

1. Version 1 will use anonymized sample lease data.
2. A database is not required for Version 1.
3. Financial calculations will use deterministic application logic.
4. VAT, CWT, CUSA, CUSA VAT, and rent escalation rates will not be hardcoded.
5. Rent-free months will remain visible in payment history and will not be treated as overdue.
6. Property-level and portfolio-level YTD summaries will be supported.
7. The AI capability will remain separate from financial calculations.
8. The AI feature will use a free local or open-source approach and will not require a paid LLM API.
9. Authentication, invoices, payment processing, accounting, and other nonessential features remain outside Version 1.
10. The scope was intentionally kept small to support reliable testing and deployment within the assignment requirements.

**Revision Result**

No major features were added after review.

The specification was clarified to prioritize:

- simple implementation;
- accurate financial calculations;
- correct handling of rent-free periods;
- configurable lease charges;
- anonymized data;
- free AI capability; and
- successful deployment.