# Duplicate Files Analysis Report

## 🔍 Found Duplicates

### 1. FinancePlotlyCharts.tsx (DUPLICATE)

**Location 1 (ACTIVE):**

- Path: `app/components/finance/FinancePlotlyCharts.tsx`
- Size: 331 lines
- Status: ✅ **IN USE**
- Used by:
  - `app/components/finance/CashFlowStatement.tsx` (line 35)
  - `app/components/finance/FinanceDashboard.tsx` (line 37)
  - `app/components/finance/index.ts` (line 15)

**Location 2 (POTENTIALLY UNUSED):**

- Path: `app/components/finance/charts/FinancePlotlyCharts.tsx`
- Size: 354 lines
- Status: ⚠️ **CHECK IF USED**
- Exported by: `app/components/finance/charts/index.ts`

**Key Differences:**

- Location 1: Uses `FinancePlotlyChart` wrapper component, expects cash flow data structure
- Location 2: Direct Plotly implementation, expects different data structure for waterfall chart

**Recommendation:**

- Check if `app/components/finance/charts/index.ts` is imported anywhere
- If not used, remove the duplicate in `charts/` subdirectory
- If used, consolidate to use one version

### 2. finance-export files (SEPARATE UTILITIES)

**Location 1:**

- Path: `lib/utils/finance-export.ts`
- Purpose: Main export utility (Excel, PDF, CSV)

**Location 2:**

- Path: `lib/utils/finance-export-pdf.ts`
- Purpose: PDF-specific export using jsPDF

**Status:** ✅ **NOT DUPLICATES** - These are separate utilities with different purposes

## 📋 Action Items

1. ✅ Verify which FinancePlotlyCharts is actually being used
2. ⚠️ Check if `charts/index.ts` exports are imported anywhere
3. ⚠️ Remove duplicate if unused
4. ✅ Keep both finance-export files (they serve different purposes)
