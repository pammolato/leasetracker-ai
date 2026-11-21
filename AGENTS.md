**LeaseTracker AI – Agent Instructions**

**Project Goal**

Build LeaseTracker AI, a simple AI-powered commercial lease management web application.

Always follow [spec.md](http://spec.md) as the primary application specification.

---

**Development Principles**

Keep the application simple.

Prefer the simplest working solution.

Do not add features that are not required by [spec.md](http://spec.md).

Do not redesign the project into a full property-management, accounting, tax, or payment-processing system.

---

**Data**

Use only anonymized sample data.

Do not use:

- real tenant names;
- personal contact information;
- banking information;
- tax identification numbers;
- confidential lease documents; or
- other sensitive information.

For Version 1, static local sample data is acceptable.

A database is not required.

---

**Financial Calculations**

Financial calculations must use deterministic application logic.

Do not use AI to calculate:

- basic rent;
- VAT;
- CWT;
- CUSA;
- CUSA VAT;
- expected cash;
- outstanding balances;
- collection rate; or
- YTD totals.

Rates must come from the lease data.

Do not hardcode VAT, CWT, or CUSA VAT rates.

---

**AI Feature**

The project should contain one small AI feature:

AI Lease Attention

It should classify lease situations into:

- High Attention;
- Medium Attention; or
- Low Attention.

Use a free local or open-source approach.

Do not require a paid OpenAI or Claude API.

Keep the AI implementation separate from financial calculations.

---

**User Interface**

Keep the interface:

- clean;
- simple;
- responsive; and
- easy to understand.

Use clear cards and tables.

Use:

- green for normal or paid;
- amber for items requiring attention; and
- red for overdue or high-attention items.

Use Philippine peso formatting for monetary values.

---

**Testing**

Create automated tests for important business logic.

At minimum test:

1. occupancy calculation;
2. CWT turned off; and
3. rent escalation.

Additional tests are encouraged only if they remain simple.

---

**Code Quality**

Use:

- clear variable names;
- small reusable functions;
- simple comments where necessary;
- input validation; and
- consistent formatting.

Avoid unnecessary libraries and dependencies.

---

**Security**

Never hardcode secrets.

Never commit:

- API keys;
- passwords;
- credentials;
- .env files containing secrets; or
- confidential information.

---

**Scope Control**

Do not add:

- authentication;
- payment processing;
- invoice generation;
- accounting;
- tax filing;
- tenant portals;
- email automation;
- SMS automation;
- document management;
- PDC monitoring;
- user-role systems; or
- lease-document analysis.

These are outside Version 1.

If something is not required by [spec.md](http://spec.md), prefer not to build it.

---

**Priority**

When making development decisions, use this order:

1. Correctness
2. Simplicity
3. Assignment requirements
4. Usability
5. Appearance

The goal is a small, working, testable, deployable application.