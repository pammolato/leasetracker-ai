"use client";

import { Fragment, useState } from "react";
import { properties, type Lease } from "@/data/leaseData";
import { AppShell } from "@/components/AppShell";
import { formatPeso } from "@/lib/dashboard";

type StatusFilter = "all" | "Active" | "Expired" | "Terminated";

interface LeaseRow {
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  lease: Lease;
}

const leaseRows: LeaseRow[] = properties.flatMap((property) =>
  property.units.flatMap((unit) =>
    unit.lease === null
      ? []
      : [
          {
            propertyId: property.propertyId,
            propertyName: property.propertyName,
            unitNumber: unit.unitNumber,
            lease: unit.lease,
          },
        ],
  ),
);

function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

function formatRate(rate: number): string {
  return `${new Intl.NumberFormat("en-PH", {
    maximumFractionDigits: 2,
  }).format(rate * 100)}%`;
}

function rentInclusiveOfVat(lease: Lease): number {
  if (!lease.vatApplicable || lease.vatRate === null) {
    return lease.basicMonthlyRent;
  }

  return Math.round(lease.basicMonthlyRent * (1 + lease.vatRate) * 100) / 100;
}

function renewalLabel(lease: Lease): string {
  if (lease.leaseStatus === "Expired" && lease.renewalStatus === "Pending") {
    return "Renewal in Process";
  }

  return lease.renewalStatus;
}

function optionalAmount(applicable: boolean, amount: number | null): string {
  if (!applicable || amount === null) {
    return "Not applicable";
  }

  return formatPeso(amount);
}

function optionalRate(applicable: boolean, rate: number | null): string {
  if (!applicable || rate === null) {
    return "Not applicable";
  }

  return formatRate(rate);
}

function optionalDate(applicable: boolean, isoDate: string | null): string {
  if (!applicable || isoDate === null) {
    return "Not applicable";
  }

  return formatDate(isoDate);
}

export default function LeasesPage() {
  const [propertyId, setPropertyId] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [openLeaseId, setOpenLeaseId] = useState<string | null>(null);

  const visibleLeases = leaseRows.filter((row) => {
    const propertyMatches = propertyId === "all" || row.propertyId === propertyId;
    const statusMatches = status === "all" || row.lease.leaseStatus === status;
    return propertyMatches && statusMatches;
  });

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Leases</h2>
          <p className="text-sm text-slate-600">Sample commercial leases</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
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
            Lease Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as StatusFilter)}
              className="min-w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            >
              <option value="all">All</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Terminated">Terminated</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Tenant</th>
                <th className="px-3 py-2 font-medium">Property</th>
                <th className="px-3 py-2 font-medium">Unit</th>
                <th className="px-3 py-2 font-medium">Lease Start</th>
                <th className="px-3 py-2 font-medium">Lease Expiration</th>
                <th className="px-3 py-2 font-medium">Rent (inclusive of VAT)</th>
                <th className="px-3 py-2 font-medium">Renewal Status</th>
                <th className="px-3 py-2 font-medium">Lease Status</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">Details</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleLeases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-3 py-4 text-slate-500">
                    No leases match these filters.
                  </td>
                </tr>
              ) : (
                visibleLeases.map((row) => {
                  const open = openLeaseId === row.lease.leaseId;
                  const renewal = renewalLabel(row.lease);
                  const cusaVatOn = row.lease.cusaApplicable && row.lease.cusaVatApplicable;

                  return (
                    <Fragment key={row.lease.leaseId}>
                      <tr className="border-t border-slate-100">
                        <td className="px-3 py-2 font-medium">{row.lease.tenantName}</td>
                        <td className="px-3 py-2">{row.propertyName}</td>
                        <td className="px-3 py-2">Unit {row.unitNumber}</td>
                        <td className="px-3 py-2">{formatDate(row.lease.leaseStartDate)}</td>
                        <td className="px-3 py-2">{formatDate(row.lease.leaseExpirationDate)}</td>
                        <td className="px-3 py-2">{formatPeso(rentInclusiveOfVat(row.lease))}</td>
                        <td
                          className={
                            renewal === "Renewal in Process"
                              ? "px-3 py-2 font-medium text-red-700"
                              : "px-3 py-2"
                          }
                        >
                          {renewal}
                        </td>
                        <td className="px-3 py-2">{row.lease.leaseStatus}</td>
                        <td className="px-3 py-2">
                          <button
                            type="button"
                            className="text-sm font-medium text-slate-700 underline"
                            aria-expanded={open}
                            onClick={() =>
                              setOpenLeaseId(open ? null : row.lease.leaseId)
                            }
                          >
                            {open ? "Hide details" : "View details"}
                          </button>
                        </td>
                      </tr>
                      {open ? (
                        <tr className="border-t border-slate-100 bg-slate-50">
                          <td colSpan={9} className="px-3 py-3">
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                              <Detail
                                label="Basic Monthly Rent"
                                value={formatPeso(row.lease.basicMonthlyRent)}
                              />
                              <Detail label="VAT Applicable" value={row.lease.vatApplicable ? "Yes" : "No"} />
                              <Detail
                                label="VAT Rate"
                                value={optionalRate(row.lease.vatApplicable, row.lease.vatRate)}
                              />
                              <Detail label="CWT Applicable" value={row.lease.cwtApplicable ? "Yes" : "No"} />
                              <Detail
                                label="CWT Rate"
                                value={optionalRate(row.lease.cwtApplicable, row.lease.cwtRate)}
                              />
                              <Detail label="CUSA Applicable" value={row.lease.cusaApplicable ? "Yes" : "No"} />
                              <Detail
                                label="CUSA VAT Applicable"
                                value={
                                  row.lease.cusaApplicable
                                    ? row.lease.cusaVatApplicable
                                      ? "Yes"
                                      : "No"
                                    : "Not applicable"
                                }
                              />
                              <Detail
                                label="CUSA VAT Rate"
                                value={optionalRate(cusaVatOn, row.lease.cusaVatRate)}
                              />
                              <Detail
                                label="Monthly CUSA Amount"
                                value={optionalAmount(row.lease.cusaApplicable, row.lease.monthlyCusaAmount)}
                              />
                              <Detail
                                label="Rent Escalation Applicable"
                                value={row.lease.escalationApplicable ? "Yes" : "No"}
                              />
                              <Detail
                                label="Escalation Rate"
                                value={optionalRate(row.lease.escalationApplicable, row.lease.escalationRate)}
                              />
                              <Detail
                                label="Escalation Effective Date"
                                value={optionalDate(
                                  row.lease.escalationApplicable,
                                  row.lease.escalationEffectiveDate,
                                )}
                              />
                              <Detail
                                label="Security Deposit"
                                value={formatPeso(row.lease.securityDeposit)}
                              />
                              <Detail label="Renewal Status" value={renewal} />
                            </dl>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}
