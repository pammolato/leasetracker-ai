"use client";

import { useState } from "react";
import { properties } from "@/data/leaseData";
import { AppShell } from "@/components/AppShell";
import {
  formatPercent,
  formatPeso,
  leaseAlerts,
  occupancyRate,
  paymentAlerts,
  reportingYear,
  selectedProperties,
  vacantUnits,
  ytdPayments,
  ytdTotals,
} from "@/lib/dashboard";
import { leaseAttention } from "@/lib/leaseAttention";

export default function Home() {
  const [propertyId, setPropertyId] = useState("all");
  const totals = ytdTotals(ytdPayments(propertyId, reportingYear));
  const occupancy = occupancyRate(propertyId);
  const occupiedCount = selectedProperties(propertyId)
    .flatMap((property) => property.units)
    .filter((unit) => unit.occupancyStatus === "Occupied").length;
  const vacancies = vacantUnits(propertyId);
  const vacancyGroups = Array.from(
    vacancies.reduce((groups, unit) => {
      const group = groups.get(unit.propertyId) ?? {
        propertyName: unit.propertyName,
        units: [],
      };
      group.units.push(unit);
      groups.set(unit.propertyId, group);
      return groups;
    }, new Map<string, { propertyName: string; units: typeof vacancies }>()),
  );
  const alerts = leaseAlerts(propertyId);
  const paymentAlertItems = paymentAlerts(propertyId);
  const attentionItems = leaseAttention(propertyId);

  const summaryCards = [
    { title: "Occupancy Rate", value: formatPercent(occupancy) },
    { title: "YTD Basic Rent", value: formatPeso(totals.basicRent) },
    { title: "YTD Expected Cash", value: formatPeso(totals.expectedCash) },
    { title: "YTD Collected", value: formatPeso(totals.collected) },
    { title: "YTD Outstanding", value: formatPeso(totals.outstanding) },
    { title: "Collection Rate", value: formatPercent(totals.collectionRate) },
  ];

  const breakdownRows = [
    { label: "Basic Rent", value: totals.basicRent },
    { label: "VAT", value: totals.vat },
    { label: "Basic CUSA", value: totals.basicCusa },
    { label: "CUSA VAT", value: totals.cusaVat },
    { label: "Gross Charges", value: totals.grossCharges },
    { label: "CWT", value: totals.cwt },
    { label: "Expected Cash", value: totals.expectedCash },
    { label: "Amount Collected", value: totals.collected },
    { label: "Outstanding", value: totals.outstanding },
  ];

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
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
            Year
            <select
              defaultValue={reportingYear}
              className="min-w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900"
            >
              <option value={reportingYear}>{reportingYear}</option>
            </select>
          </label>
        </div>

        <section aria-label="Summary" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {summaryCards.map((card) => (
            <article
              key={card.title}
              className="rounded-lg border border-slate-200 bg-white p-4"
            >
              <h2 className="text-sm font-medium text-slate-600">{card.title}</h2>
              <p className="mt-2 text-2xl font-semibold tracking-tight">{card.value}</p>
              {card.title === "Occupancy Rate" ? (
                <p className="mt-1 text-xs leading-4 text-slate-500">
                  {occupiedCount} occupied • {vacancies.length} vacant
                </p>
              ) : null}
              {card.title === "YTD Basic Rent" ? (
                <p className="mt-1 text-xs leading-4 text-slate-500">
                  <span className="block">
                    VAT {formatPeso(totals.vat)}
                  </span>
                  <span className="block">
                    CUSA {formatPeso(totals.basicCusa)}
                    <span className="px-1" aria-hidden="true">
                      •
                    </span>
                    CUSA VAT {formatPeso(totals.cusaVat)}
                  </span>
                </p>
              ) : null}
            </article>
          ))}
        </section>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">YTD Rent Breakdown</h2>
            <dl className="mt-2">
              {breakdownRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-4 py-1.5 text-sm">
                  <dt className="text-slate-600">{row.label}</dt>
                  <dd className="font-medium">{formatPeso(row.value)}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Payment Alerts</h2>
            {paymentAlertItems.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No payment alerts.</p>
            ) : (
              <ul className="mt-2">
                {paymentAlertItems.map((alert) => (
                  <li
                    key={alert.paymentId}
                    className="flex flex-col gap-0.5 border-t border-slate-100 py-2 text-sm first:border-t-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 sm:gap-y-1"
                  >
                    <span className="font-medium">{alert.tenantName}</span>
                    <span className="text-slate-600">{alert.propertyName}</span>
                    <span className="text-slate-600">{alert.billingMonth}</span>
                    <span className="text-slate-600">Expected {formatPeso(alert.expectedCash)}</span>
                    <span className="text-slate-600">Paid {formatPeso(alert.amountPaid)}</span>
                    <span className="text-slate-600">Outstanding {formatPeso(alert.outstanding)}</span>
                    <span className="text-slate-600">{alert.dueDate}</span>
                    <span
                      className={
                        alert.kind === "Overdue"
                          ? "font-medium text-red-700"
                          : alert.kind === "Partially Paid"
                            ? "font-medium text-amber-700"
                            : "font-medium text-yellow-700"
                      }
                    >
                      {alert.kind}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">Lease Alerts</h2>
            {alerts.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No lease alerts.</p>
            ) : (
              <ul className="mt-2">
                {alerts.map((alert) => (
                  <li
                    key={`${alert.leaseId}-${alert.kind}`}
                    className="flex flex-col gap-0.5 border-t border-slate-100 py-2 text-sm first:border-t-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <span className="font-medium">
                      {alert.propertyName} · Unit {alert.unitNumber}
                    </span>
                    <span className="text-slate-600">{alert.tenantName}</span>
                    <span
                      className={
                        alert.kind === "Renewal in Process"
                          ? "font-medium text-red-700"
                          : "font-medium text-amber-700"
                      }
                    >
                      {alert.kind}
                    </span>
                    <span className="text-slate-600">{alert.date}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Vacant Units</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                {vacancies.length} vacant {vacancies.length === 1 ? "unit" : "units"}
              </span>
            </div>
            {vacancies.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No vacant units.</p>
            ) : (
              <div className="mt-3 flex flex-col gap-3">
                {vacancyGroups.map(([propertyId, group]) => (
                  <div key={propertyId}>
                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                      <h3 className="text-sm font-medium">{group.propertyName}</h3>
                      <span className="text-xs text-slate-500">
                        {group.units.length} vacant {group.units.length === 1 ? "unit" : "units"}
                      </span>
                    </div>
                    <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
                      {group.units.map((unit) => (
                        <li
                          key={`${unit.propertyId}-${unit.unitId}`}
                          className="rounded-md border border-slate-200 px-2 py-1.5"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-sm font-semibold leading-5">Unit {unit.unitNumber}</p>
                            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium leading-4 text-amber-800">
                              Vacant
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">{unit.floorAreaSqm} sqm</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">AI Lease Attention</h2>
            <p className="mt-1 text-xs text-slate-500">
              AI-assisted classification from lease records as of 20 November 2026.
            </p>
            {attentionItems.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No leases to classify.</p>
            ) : (
              <ul className="mt-2">
                {attentionItems.map((item) => (
                  <li
                    key={item.leaseId}
                    className="flex flex-col gap-0.5 border-t border-slate-100 py-2 text-sm first:border-t-0"
                  >
                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <span className="font-medium">{item.tenantName}</span>
                      <span className="text-slate-600">{item.propertyName}</span>
                      <span className="text-slate-600">Unit {item.unitNumber}</span>
                      <span
                        className={
                          item.attention === "High Attention"
                            ? "font-medium text-red-700"
                            : item.attention === "Medium Attention"
                              ? "font-medium text-amber-700"
                              : "font-medium text-green-700"
                        }
                      >
                        {item.attention}
                      </span>
                    </div>
                    <p className="text-slate-600">{item.reasons}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
    </AppShell>
  );
}
