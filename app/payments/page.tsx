"use client";

import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { properties, type PaymentStatus } from "@/data/leaseData";
import { formatPeso } from "@/lib/dashboard";

type StatusFilter = "all" | PaymentStatus;

interface PaymentRow {
  paymentId: string;
  propertyId: string;
  propertyName: string;
  tenantName: string;
  billingMonth: string;
  basicRentDue: number;
  vatDue: number;
  basicCusaDue: number;
  cusaVatDue: number;
  cwtDeduction: number;
  expectedCash: number;
  amountPaid: number | null;
  paymentDate: string | null;
  paymentStatus: PaymentStatus;
}

const paymentRows: PaymentRow[] = properties.flatMap((property) =>
  property.units.flatMap((unit) => {
    const lease = unit.lease;
    if (lease === null) {
      return [];
    }

    return lease.payments.map((payment) => ({
      paymentId: payment.paymentId,
      propertyId: property.propertyId,
      propertyName: property.propertyName,
      tenantName: lease.tenantName,
      billingMonth: payment.billingMonth,
      basicRentDue: payment.basicRentDue,
      vatDue: payment.vatDue,
      basicCusaDue: payment.basicCusaDue,
      cusaVatDue: payment.cusaVatDue,
      cwtDeduction: payment.cwtDeduction,
      expectedCash: payment.expectedCash,
      amountPaid: payment.amountPaid,
      paymentDate: payment.paymentDate,
      paymentStatus: payment.paymentStatus,
    }));
  }),
);

const billingMonths = [...new Set(paymentRows.map((row) => row.billingMonth))].sort();

const statusOptions: PaymentStatus[] = ["Paid", "Partially Paid", "Unpaid", "Rent Free"];

function formatMonth(billingMonth: string): string {
  const [year, month] = billingMonth.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function cents(value: number): number {
  return Math.round(value * 100);
}

function pesos(valueInCents: number): number {
  return valueInCents / 100;
}

function statusClass(status: PaymentStatus): string {
  if (status === "Paid") {
    return "bg-green-100 text-green-800";
  }
  if (status === "Partially Paid") {
    return "bg-amber-100 text-amber-800";
  }
  if (status === "Unpaid") {
    return "bg-red-100 text-red-800";
  }
  return "bg-sky-100 text-sky-800";
}

export default function PaymentsPage() {
  const [propertyId, setPropertyId] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [billingMonth, setBillingMonth] = useState("all");

  const visiblePayments = paymentRows
    .filter((row) => {
      const propertyMatches = propertyId === "all" || row.propertyId === propertyId;
      const statusMatches = status === "all" || row.paymentStatus === status;
      const monthMatches = billingMonth === "all" || row.billingMonth === billingMonth;
      return propertyMatches && statusMatches && monthMatches;
    })
    .sort(
      (left, right) =>
        left.billingMonth.localeCompare(right.billingMonth) ||
        left.propertyName.localeCompare(right.propertyName) ||
        left.tenantName.localeCompare(right.tenantName) ||
        left.paymentId.localeCompare(right.paymentId),
    );

  let expectedCents = 0;
  let collectedCents = 0;
  for (const row of visiblePayments) {
    expectedCents += cents(row.expectedCash);
    collectedCents += cents(row.amountPaid ?? 0);
  }
  const expectedCash = pesos(expectedCents);
  const collected = pesos(collectedCents);
  const outstanding = pesos(expectedCents - collectedCents);

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Payments</h2>
          <p className="text-sm text-slate-600">Sample monthly payment records</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Property
            <select
              value={propertyId}
              onChange={(event) => setPropertyId(event.target.value)}
              className="min-w-48 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            >
              <option value="all">All Properties</option>
              {properties.map((property) => (
                <option key={property.propertyId} value={property.propertyId}>
                  {property.propertyName}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Payment Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="min-w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            >
              <option value="all">All</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
            Billing Month
            <select
              value={billingMonth}
              onChange={(event) => setBillingMonth(event.target.value)}
              className="min-w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            >
              <option value="all">All</option>
              {billingMonths.map((month) => (
                <option key={month} value={month}>
                  {formatMonth(month)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section aria-label="Filtered payment totals" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-medium text-slate-600">Expected Cash</h3>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatPeso(expectedCash)}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-medium text-slate-600">Amount Collected</h3>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatPeso(collected)}</p>
          </article>
          <article className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-medium text-slate-600">Outstanding</h3>
            <p className="mt-2 text-2xl font-semibold tracking-tight">{formatPeso(outstanding)}</p>
          </article>
        </section>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Billing Month</th>
                <th className="px-3 py-2 font-medium">Tenant</th>
                <th className="px-3 py-2 font-medium">Property</th>
                <th className="px-3 py-2 font-medium">Basic Rent</th>
                <th className="px-3 py-2 font-medium">VAT</th>
                <th className="px-3 py-2 font-medium">Basic CUSA</th>
                <th className="px-3 py-2 font-medium">CUSA VAT</th>
                <th className="px-3 py-2 font-medium">CWT</th>
                <th className="px-3 py-2 font-medium">Expected Cash</th>
                <th className="px-3 py-2 font-medium">Amount Paid</th>
                <th className="px-3 py-2 font-medium">Payment Date</th>
                <th className="px-3 py-2 font-medium">Payment Status</th>
              </tr>
            </thead>
            <tbody>
              {visiblePayments.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-3 py-4 text-slate-500">
                    No payments match these filters.
                  </td>
                </tr>
              ) : (
                visiblePayments.map((row) => (
                  <tr key={row.paymentId} className="border-t border-slate-100">
                    <td className="px-3 py-2">{formatMonth(row.billingMonth)}</td>
                    <td className="px-3 py-2 font-medium">{row.tenantName}</td>
                    <td className="px-3 py-2">{row.propertyName}</td>
                    <td className="px-3 py-2">{formatPeso(row.basicRentDue)}</td>
                    <td className="px-3 py-2">{formatPeso(row.vatDue)}</td>
                    <td className="px-3 py-2">{formatPeso(row.basicCusaDue)}</td>
                    <td className="px-3 py-2">{formatPeso(row.cusaVatDue)}</td>
                    <td className="px-3 py-2">{formatPeso(row.cwtDeduction)}</td>
                    <td className="px-3 py-2">{formatPeso(row.expectedCash)}</td>
                    <td className="px-3 py-2">{formatPeso(row.amountPaid ?? 0)}</td>
                    <td className="px-3 py-2">
                      {row.paymentDate === null ? "—" : formatDate(row.paymentDate)}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(row.paymentStatus)}`}
                      >
                        {row.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}
