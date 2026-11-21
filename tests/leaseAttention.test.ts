import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyLeaseAttention } from "../lib/leaseAttention.ts";

test("paid rent with an expired lease and pending renewal is high attention", () => {
  const text = "Rent is paid. Lease has expired. Renewal is pending. Rent escalation does not apply.";

  assert.equal(classifyLeaseAttention(text), "High Attention");
});

test("partially paid rent on an active lease is medium attention", () => {
  const text =
    "Rent is partially paid. Lease is active. Renewal is not yet due. Rent escalation does not apply.";

  assert.equal(classifyLeaseAttention(text), "Medium Attention");
});

test("paid rent on an active lease with no immediate event is low attention", () => {
  const text =
    "Rent is paid. Lease is active. Renewal is not yet due. Rent escalation does not apply.";

  assert.equal(classifyLeaseAttention(text), "Low Attention");
});
