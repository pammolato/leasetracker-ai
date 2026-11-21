import assert from "node:assert/strict";
import { test } from "node:test";
import {
  chargeTotals,
  classifyPaymentAlert,
  cusaAmounts,
  cwtAmount,
  escalatedBasicRent,
  occupancyPercent,
} from "../lib/calculations.ts";

test("occupancy is occupied units divided by total units", () => {
  assert.equal(occupancyPercent(8, 10), 80);
});

test("CWT is zero when CWT is not applicable", () => {
  assert.equal(cwtAmount(100000, false, 0.05), 0);
});

test("rent escalation increases basic rent by the lease rate", () => {
  assert.equal(escalatedBasicRent(100000, true, 0.05), 105000);
});

test("CUSA without VAT keeps the monthly amount and charges no CUSA VAT", () => {
  assert.deepEqual(cusaAmounts(true, false, null, 15000), {
    basicCusa: 15000,
    cusaVat: 0,
  });
});

test("CUSA with VAT splits a VAT-inclusive monthly amount", () => {
  assert.deepEqual(cusaAmounts(true, true, 0.12, 15000), {
    basicCusa: 13392.86,
    cusaVat: 1607.14,
  });
});

test("a rent-free payment is not classified as overdue", () => {
  const classification = classifyPaymentAlert("Rent Free", "2026-01-01", "2026-11-20");

  assert.notEqual(classification, "Overdue");
  assert.equal(classification, null);
});

test("expected cash is gross charges minus CWT", () => {
  assert.deepEqual(
    chargeTotals({
      basicRent: 100000,
      vat: 12000,
      basicCusa: 15000,
      cusaVat: 1800,
      cwt: 5000,
    }),
    {
      grossCharges: 128800,
      expectedCash: 123800,
    },
  );
});
