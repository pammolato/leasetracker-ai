import { properties, type Payment, type Property } from "@/data/leaseData";
import { classifyPaymentAlert, occupancyPercent } from "@/lib/calculations";

export const reportingYear = "2026";

/** Reporting date for the 2026 sample year. Date-only comparisons use this value. */
export const reportingDate = "2026-11-20";

export interface YtdTotals {
  basicRent: number;
  vat: number;
  basicCusa: number;
  cusaVat: number;
  grossCharges: number;
  cwt: number;
  expectedCash: number;
  collected: number;
  outstanding: number;
  collectionRate: number;
}

function cents(value: number): number {
  return Math.round(value * 100);
}

function pesos(valueInCents: number): number {
  return valueInCents / 100;
}

export function selectedProperties(propertyId: string): Property[] {
  if (propertyId === "all") {
    return properties;
  }

  return properties.filter((property) => property.propertyId === propertyId);
}

export interface VacantUnit {
  propertyId: string;
  propertyName: string;
  unitId: string;
  unitNumber: string;
  floorAreaSqm: number;
}

export function vacantUnits(propertyId: string): VacantUnit[] {
  return selectedProperties(propertyId).flatMap((property) =>
    property.units
      .filter((unit) => unit.occupancyStatus === "Vacant")
      .map((unit) => ({
        propertyId: property.propertyId,
        propertyName: property.propertyName,
        unitId: unit.unitId,
        unitNumber: unit.unitNumber,
        floorAreaSqm: unit.floorAreaSqm,
      })),
  );
}

export type LeaseAlertKind =
  | "Renewal in Process"
  | "Expiring Soon"
  | "Upcoming"
  | "Upcoming Escalation";

export interface LeaseAlert {
  leaseId: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  tenantName: string;
  kind: LeaseAlertKind;
  date: string;
  daysUntil: number;
}

const leaseAlertUrgency: Record<LeaseAlertKind, number> = {
  "Renewal in Process": 0,
  "Expiring Soon": 1,
  Upcoming: 2,
  "Upcoming Escalation": 3,
};

function utcDay(isoDate: string): number {
  const [year, month, day] = isoDate.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function daysUntil(asOf: string, date: string): number {
  return utcDay(date) - utcDay(asOf);
}

export function leaseAlerts(propertyId: string, asOf: string = reportingDate): LeaseAlert[] {
  const alerts: LeaseAlert[] = [];

  for (const property of selectedProperties(propertyId)) {
    for (const unit of property.units) {
      const lease = unit.lease;
      if (lease === null) {
        continue;
      }

      const expirationDays = daysUntil(asOf, lease.leaseExpirationDate);
      const renewalInProcess =
        lease.leaseStatus === "Expired" && lease.renewalStatus === "Pending";

      if (renewalInProcess) {
        alerts.push({
          leaseId: lease.leaseId,
          propertyId: property.propertyId,
          propertyName: property.propertyName,
          unitNumber: unit.unitNumber,
          tenantName: lease.tenantName,
          kind: "Renewal in Process",
          date: lease.leaseExpirationDate,
          daysUntil: expirationDays,
        });
      } else if (expirationDays >= 0 && expirationDays <= 90) {
        alerts.push({
          leaseId: lease.leaseId,
          propertyId: property.propertyId,
          propertyName: property.propertyName,
          unitNumber: unit.unitNumber,
          tenantName: lease.tenantName,
          kind: "Expiring Soon",
          date: lease.leaseExpirationDate,
          daysUntil: expirationDays,
        });
      } else if (expirationDays >= 91 && expirationDays <= 180) {
        alerts.push({
          leaseId: lease.leaseId,
          propertyId: property.propertyId,
          propertyName: property.propertyName,
          unitNumber: unit.unitNumber,
          tenantName: lease.tenantName,
          kind: "Upcoming",
          date: lease.leaseExpirationDate,
          daysUntil: expirationDays,
        });
      }

      if (
        lease.escalationApplicable &&
        lease.escalationEffectiveDate !== null
      ) {
        const escalationDays = daysUntil(asOf, lease.escalationEffectiveDate);
        if (escalationDays >= 0 && escalationDays <= 180) {
          alerts.push({
            leaseId: lease.leaseId,
            propertyId: property.propertyId,
            propertyName: property.propertyName,
            unitNumber: unit.unitNumber,
            tenantName: lease.tenantName,
            kind: "Upcoming Escalation",
            date: lease.escalationEffectiveDate,
            daysUntil: escalationDays,
          });
        }
      }
    }
  }

  alerts.sort(
    (left, right) =>
      leaseAlertUrgency[left.kind] - leaseAlertUrgency[right.kind] ||
      left.daysUntil - right.daysUntil,
  );

  return alerts;
}

export type PaymentAlertKind = "Overdue" | "Partially Paid" | "Due Soon";

export interface PaymentAlert {
  paymentId: string;
  propertyName: string;
  tenantName: string;
  billingMonth: string;
  dueDate: string;
  expectedCash: number;
  amountPaid: number;
  outstanding: number;
  kind: PaymentAlertKind;
}

const paymentAlertUrgency: Record<PaymentAlertKind, number> = {
  Overdue: 0,
  "Partially Paid": 1,
  "Due Soon": 2,
};

export function paymentAlerts(propertyId: string, asOf: string = reportingDate): PaymentAlert[] {
  const alerts: PaymentAlert[] = [];

  for (const property of selectedProperties(propertyId)) {
    for (const unit of property.units) {
      const lease = unit.lease;
      if (lease === null) {
        continue;
      }

      for (const payment of lease.payments) {
        const kind = classifyPaymentAlert(payment.paymentStatus, payment.dueDate, asOf);

        if (kind === null) {
          continue;
        }

        const amountPaid = payment.amountPaid ?? 0;
        alerts.push({
          paymentId: payment.paymentId,
          propertyName: property.propertyName,
          tenantName: lease.tenantName,
          billingMonth: payment.billingMonth,
          dueDate: payment.dueDate,
          expectedCash: payment.expectedCash,
          amountPaid,
          outstanding: pesos(cents(payment.expectedCash) - cents(amountPaid)),
          kind,
        });
      }
    }
  }

  alerts.sort(
    (left, right) =>
      paymentAlertUrgency[left.kind] - paymentAlertUrgency[right.kind] ||
      left.dueDate.localeCompare(right.dueDate),
  );

  return alerts;
}

export function occupancyRate(propertyId: string): number {
  const units = selectedProperties(propertyId).flatMap((property) => property.units);
  const occupied = units.filter((unit) => unit.occupancyStatus === "Occupied").length;
  return occupancyPercent(occupied, units.length);
}

export function ytdPayments(propertyId: string, year: string): Payment[] {
  return selectedProperties(propertyId).flatMap((property) =>
    property.units.flatMap((unit) =>
      unit.lease === null
        ? []
        : unit.lease.payments.filter((payment) => payment.billingMonth.startsWith(`${year}-`)),
    ),
  );
}

export function ytdTotals(payments: Payment[]): YtdTotals {
  let basicRent = 0;
  let vat = 0;
  let basicCusa = 0;
  let cusaVat = 0;
  let cwt = 0;
  let expectedCash = 0;
  let collected = 0;

  for (const payment of payments) {
    basicRent += cents(payment.basicRentDue);
    vat += cents(payment.vatDue);
    basicCusa += cents(payment.basicCusaDue);
    cusaVat += cents(payment.cusaVatDue);
    cwt += cents(payment.cwtDeduction);
    expectedCash += cents(payment.expectedCash);
    collected += cents(payment.amountPaid ?? 0);
  }

  const grossCharges = basicRent + vat + basicCusa + cusaVat;
  const outstanding = expectedCash - collected;

  return {
    basicRent: pesos(basicRent),
    vat: pesos(vat),
    basicCusa: pesos(basicCusa),
    cusaVat: pesos(cusaVat),
    grossCharges: pesos(grossCharges),
    cwt: pesos(cwt),
    expectedCash: pesos(expectedCash),
    collected: pesos(collected),
    outstanding: pesos(outstanding),
    collectionRate: expectedCash === 0 ? 0 : (collected / expectedCash) * 100,
  };
}

export function formatPeso(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat("en-PH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value)}%`;
}
