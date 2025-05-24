// Tax brackets for 2024 (simplified for demonstration)
const FEDERAL_TAX_BRACKETS_2024 = [
  { min: 0, max: 55867, rate: 0.15 },
  { min: 55867, max: 111733, rate: 0.205 },
  { min: 111733, max: 173205, rate: 0.26 },
  { min: 173205, max: 246752, rate: 0.29 },
  { min: 246752, max: Number.POSITIVE_INFINITY, rate: 0.33 },
]

// Provincial tax brackets for 2024 (simplified)
const PROVINCIAL_TAX_BRACKETS_2024: Record<string, Array<{ min: number; max: number; rate: number }>> = {
  ON: [
    { min: 0, max: 49231, rate: 0.0505 },
    { min: 49231, max: 98463, rate: 0.0915 },
    { min: 98463, max: 150000, rate: 0.1116 },
    { min: 150000, max: 220000, rate: 0.1216 },
    { min: 220000, max: Number.POSITIVE_INFINITY, rate: 0.1316 },
  ],
  BC: [
    { min: 0, max: 45654, rate: 0.0506 },
    { min: 45654, max: 91310, rate: 0.077 },
    { min: 91310, max: 104835, rate: 0.105 },
    { min: 104835, max: 127299, rate: 0.1229 },
    { min: 127299, max: 172602, rate: 0.147 },
    { min: 172602, max: 240716, rate: 0.168 },
    { min: 240716, max: Number.POSITIVE_INFINITY, rate: 0.205 },
  ],
  AB: [
    { min: 0, max: 148269, rate: 0.1 },
    { min: 148269, max: 177922, rate: 0.12 },
    { min: 177922, max: 237999, rate: 0.13 },
    { min: 237999, max: 355486, rate: 0.14 },
    { min: 355486, max: Number.POSITIVE_INFINITY, rate: 0.15 },
  ],
  // Add other provinces as needed
}

// CPP rates
const CPP_RATE_2024 = 0.0595 // Employee portion
const CPP_RATE_SELF_EMPLOYED_2024 = 0.119 // Self-employed (both portions)
const CPP_MAX_PENSIONABLE_EARNINGS_2024 = 68500
const CPP_BASIC_EXEMPTION_2024 = 3500

// Calculate marginal tax rate based on annual income
export const calculateMarginalTaxRate = (
  annualIncome: number,
  province = "ON",
): {
  federalRate: number
  provincialRate: number
  combinedRate: number
  effectiveFederalRate: number
  effectiveProvincialRate: number
  effectiveCombinedRate: number
} => {
  // Get the applicable federal tax bracket
  const federalBracket =
    FEDERAL_TAX_BRACKETS_2024.find((bracket) => annualIncome > bracket.min && annualIncome <= bracket.max) ||
    FEDERAL_TAX_BRACKETS_2024[0]

  // Get the applicable provincial tax bracket
  const provincialBrackets = PROVINCIAL_TAX_BRACKETS_2024[province] || PROVINCIAL_TAX_BRACKETS_2024.ON
  const provincialBracket =
    provincialBrackets.find((bracket) => annualIncome > bracket.min && annualIncome <= bracket.max) ||
    provincialBrackets[0]

  // Calculate effective tax rates (total tax / income)
  const federalTax = calculateTaxAmount(annualIncome, FEDERAL_TAX_BRACKETS_2024)
  const provincialTax = calculateTaxAmount(annualIncome, provincialBrackets)

  const effectiveFederalRate = federalTax / annualIncome
  const effectiveProvincialRate = provincialTax / annualIncome
  const effectiveCombinedRate = effectiveFederalRate + effectiveProvincialRate

  return {
    federalRate: federalBracket.rate,
    provincialRate: provincialBracket.rate,
    combinedRate: federalBracket.rate + provincialBracket.rate,
    effectiveFederalRate,
    effectiveProvincialRate,
    effectiveCombinedRate,
  }
}

// Calculate tax amount based on brackets
const calculateTaxAmount = (income: number, brackets: Array<{ min: number; max: number; rate: number }>): number => {
  let tax = 0

  for (let i = 0; i < brackets.length; i++) {
    const { min, max, rate } = brackets[i]

    if (income <= min) {
      break
    }

    const taxableInThisBracket = Math.min(income, max) - min
    if (taxableInThisBracket > 0) {
      tax += taxableInThisBracket * rate
    }
  }

  return tax
}

// Calculate CPP contribution
export const calculateCPPContribution = (income: number, isSelfEmployed = true): number => {
  const pensionableEarnings = Math.min(
    Math.max(income - CPP_BASIC_EXEMPTION_2024, 0),
    CPP_MAX_PENSIONABLE_EARNINGS_2024 - CPP_BASIC_EXEMPTION_2024,
  )

  return pensionableEarnings * (isSelfEmployed ? CPP_RATE_SELF_EMPLOYED_2024 : CPP_RATE_2024)
}

// Calculate gross amount from net amount
export const calculateGrossFromNet = (
  netAmount: number,
  annualIncome: number,
  province = "ON",
): {
  grossAmount: number
  federalTax: number
  provincialTax: number
  cppPayment: number
  totalDeductions: number
} => {
  // Get tax rates based on annual income
  const { effectiveFederalRate, effectiveProvincialRate } = calculateMarginalTaxRate(annualIncome, province)

  // Calculate CPP rate (as a percentage of gross)
  const cppRate = CPP_RATE_SELF_EMPLOYED_2024

  // Combined deduction rate
  const totalDeductionRate = effectiveFederalRate + effectiveProvincialRate + cppRate

  // Calculate gross amount
  // Formula: net = gross - (gross * totalDeductionRate)
  // Therefore: gross = net / (1 - totalDeductionRate)
  const grossAmount = netAmount / (1 - totalDeductionRate)

  // Calculate individual deductions
  const federalTax = grossAmount * effectiveFederalRate
  const provincialTax = grossAmount * effectiveProvincialRate
  const cppPayment = grossAmount * cppRate
  const totalDeductions = federalTax + provincialTax + cppPayment

  return {
    grossAmount,
    federalTax,
    provincialTax,
    cppPayment,
    totalDeductions,
  }
}
