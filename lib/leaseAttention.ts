import createClassifier from "wink-naive-bayes-text-classifier";
import prepText from "wink-naive-bayes-text-classifier/src/prep-text.js";
import type { Lease, Payment } from "@/data/leaseData";
import { classifyPaymentAlert } from "@/lib/calculations";
import { reportingDate, selectedProperties } from "@/lib/dashboard";

export type AttentionLevel = "High Attention" | "Medium Attention" | "Low Attention";

export interface LeaseAttentionItem {
  leaseId: string;
  tenantName: string;
  propertyName: string;
  unitNumber: string;
  attention: AttentionLevel;
  reasons: string;
}

const attentionRank: Record<AttentionLevel, number> = {
  "High Attention": 0,
  "Medium Attention": 1,
  "Low Attention": 2,
};

const trainingExamples: Array<[string, AttentionLevel]> = [
  ["Rent is overdue. Lease has expired. Renewal is pending. Rent escalation is approaching.", "High Attention"],
  ["Rent is overdue. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "High Attention"],
  ["Rent is overdue. Lease is active. Renewal is not yet due. Rent escalation is not approaching.", "High Attention"],
  ["Rent is overdue. Lease is expiring soon. Renewal is pending. Rent escalation does not apply.", "High Attention"],
  ["Rent is paid. Lease has expired. Renewal is pending. Rent escalation does not apply.", "High Attention"],
  ["Rent is paid. Lease has expired. Renewal is not yet due. Rent escalation is not approaching.", "High Attention"],
  ["Rent is partially paid. Lease has expired. Renewal is pending. Rent escalation does not apply.", "High Attention"],
  ["The current period is rent free. Lease has expired. Renewal is pending. Rent escalation does not apply.", "High Attention"],
  ["Rent is partially paid. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "Medium Attention"],
  ["Rent is partially paid. Lease is active. Renewal is not yet due. Rent escalation is not approaching.", "Medium Attention"],
  ["Rent is due soon. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "Medium Attention"],
  ["Rent is due soon. Lease is active. Renewal is not yet due. Rent escalation is not approaching.", "Medium Attention"],
  ["Rent is paid. Lease is expiring soon. Renewal is pending. Rent escalation does not apply.", "Medium Attention"],
  ["Rent is paid. Lease expiration is upcoming. Renewal is not yet due. Rent escalation does not apply.", "Medium Attention"],
  ["Rent is paid. Lease is active. Renewal is not yet due. Rent escalation is approaching.", "Medium Attention"],
  ["The current period is rent free. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "Medium Attention"],
  ["Rent is paid. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "Low Attention"],
  ["Rent is paid. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "Low Attention"],
  ["Rent is paid. Lease is active. Renewal is not yet due. Rent escalation is not approaching.", "Low Attention"],
  ["Rent is paid. Lease is active. Renewal is not yet due. Rent escalation is not approaching.", "Low Attention"],
  ["Rent is not yet due. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "Low Attention"],
  ["Rent is not yet due. Lease is active. Renewal is not yet due. Rent escalation is not approaching.", "Low Attention"],
  ["Rent is paid. Lease is active. Renewal is not yet due. Rent escalation does not apply.", "Low Attention"],
  ["Rent is paid. Lease is active. Renewal is not yet due. Rent escalation is not approaching.", "Low Attention"],
];

let classifier: ReturnType<typeof createClassifier> | null = null;

function attentionClassifier(): ReturnType<typeof createClassifier> {
  if (classifier !== null) {
    return classifier;
  }

  const trained = createClassifier();
  trained.definePrepTasks([prepText]);
  trained.defineConfig({ considerOnlyPresence: true, smoothingFactor: 0.5 });

  for (const [text, label] of trainingExamples) {
    trained.learn(text, label);
  }

  trained.consolidate();
  classifier = trained;
  return trained;
}

function utcDay(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function daysUntil(asOf: string, date: string): number {
  return utcDay(date) - utcDay(asOf);
}

function paymentSentence(payments: Payment[], asOf: string): string {
  const kinds = payments.map((payment) =>
    classifyPaymentAlert(payment.paymentStatus, payment.dueDate, asOf),
  );

  if (kinds.includes("Overdue")) {
    return "Rent is overdue.";
  }

  if (kinds.includes("Partially Paid")) {
    return "Rent is partially paid.";
  }

  if (kinds.includes("Due Soon")) {
    return "Rent is due soon.";
  }

  const current = payments
    .filter((payment) => payment.dueDate <= asOf)
    .sort((left, right) => right.dueDate.localeCompare(left.dueDate))[0];

  if (current?.paymentStatus === "Rent Free") {
    return "The current period is rent free.";
  }

  if (current?.paymentStatus === "Paid") {
    return "Rent is paid.";
  }

  return "Rent is not yet due.";
}

function expirationSentence(lease: Lease, asOf: string): string {
  const days = daysUntil(asOf, lease.leaseExpirationDate);

  if (lease.leaseStatus === "Expired" || days < 0) {
    return "Lease has expired.";
  }

  if (days <= 90) {
    return "Lease is expiring soon.";
  }

  if (days <= 180) {
    return "Lease expiration is upcoming.";
  }

  return "Lease is active.";
}

function renewalSentence(lease: Lease): string {
  if (lease.renewalStatus === "Pending") {
    return "Renewal is pending.";
  }

  return "Renewal is not yet due.";
}

function escalationSentence(lease: Lease, asOf: string): string {
  if (!lease.escalationApplicable || lease.escalationEffectiveDate === null) {
    return "Rent escalation does not apply.";
  }

  const days = daysUntil(asOf, lease.escalationEffectiveDate);
  if (days >= 0 && days <= 180) {
    return "Rent escalation is approaching.";
  }

  return "Rent escalation is not approaching.";
}

export function leaseSituationText(lease: Lease, asOf: string = reportingDate): string {
  return [
    paymentSentence(lease.payments, asOf),
    expirationSentence(lease, asOf),
    renewalSentence(lease),
    escalationSentence(lease, asOf),
  ].join(" ");
}

export function classifyLeaseAttention(text: string): AttentionLevel {
  const label = attentionClassifier().predict(text);

  if (label === "High Attention" || label === "Medium Attention" || label === "Low Attention") {
    return label;
  }

  return "Medium Attention";
}

export function leaseAttention(propertyId: string, asOf: string = reportingDate): LeaseAttentionItem[] {
  const items: LeaseAttentionItem[] = [];

  for (const property of selectedProperties(propertyId)) {
    for (const unit of property.units) {
      const lease = unit.lease;
      if (lease === null) {
        continue;
      }

      const reasons = leaseSituationText(lease, asOf);
      items.push({
        leaseId: lease.leaseId,
        tenantName: lease.tenantName,
        propertyName: property.propertyName,
        unitNumber: unit.unitNumber,
        attention: classifyLeaseAttention(reasons),
        reasons,
      });
    }
  }

  items.sort(
    (left, right) =>
      attentionRank[left.attention] - attentionRank[right.attention] ||
      left.propertyName.localeCompare(right.propertyName) ||
      left.unitNumber.localeCompare(right.unitNumber, undefined, { numeric: true }),
  );

  return items;
}
