export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function occupancyPercent(occupiedUnits: number, totalUnits: number): number {
  if (totalUnits === 0) {
    return 0;
  }

  return (occupiedUnits / totalUnits) * 100;
}

export function cwtAmount(
  basicRent: number,
  cwtApplicable: boolean,
  cwtRate: number | null,
): number {
  if (!cwtApplicable || cwtRate === null) {
    return 0;
  }

  return roundMoney(basicRent * cwtRate);
}

export function escalatedBasicRent(
  basicRent: number,
  escalationApplicable: boolean,
  escalationRate: number | null,
): number {
  if (!escalationApplicable || escalationRate === null) {
    return basicRent;
  }

  return roundMoney(basicRent * (1 + escalationRate));
}

export function cusaAmounts(
  cusaApplicable: boolean,
  cusaVatApplicable: boolean,
  cusaVatRate: number | null,
  monthlyCusaAmount: number,
): { basicCusa: number; cusaVat: number } {
  if (!cusaApplicable) {
    return { basicCusa: 0, cusaVat: 0 };
  }

  if (!cusaVatApplicable || cusaVatRate === null) {
    return { basicCusa: roundMoney(monthlyCusaAmount), cusaVat: 0 };
  }

  const basicCusa = roundMoney(monthlyCusaAmount / (1 + cusaVatRate));
  return {
    basicCusa,
    cusaVat: roundMoney(monthlyCusaAmount - basicCusa),
  };
}

export function chargeTotals(input: {
  basicRent: number;
  vat: number;
  basicCusa: number;
  cusaVat: number;
  cwt: number;
}): { grossCharges: number; expectedCash: number } {
  const grossCharges = roundMoney(
    input.basicRent + input.vat + input.basicCusa + input.cusaVat,
  );

  return {
    grossCharges,
    expectedCash: roundMoney(grossCharges - input.cwt),
  };
}

export type PaymentAlertClassification = "Overdue" | "Partially Paid" | "Due Soon";

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function classifyPaymentAlert(
  paymentStatus: "Paid" | "Partially Paid" | "Unpaid" | "Rent Free",
  dueDate: string,
  asOf: string,
): PaymentAlertClassification | null {
  if (paymentStatus === "Partially Paid") {
    return "Partially Paid";
  }

  if (paymentStatus !== "Unpaid") {
    return null;
  }

  if (dueDate < asOf) {
    return "Overdue";
  }

  const dueSoonEnd = addDays(asOf, 7);
  if (dueDate <= dueSoonEnd) {
    return "Due Soon";
  }

  return null;
}
