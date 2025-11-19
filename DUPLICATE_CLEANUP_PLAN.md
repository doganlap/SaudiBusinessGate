# Duplicate Files Cleanup Plan

## 📋 Summary

Found **1 duplicate file** that needs attention:

### FinancePlotlyCharts.tsx

**Active Version (KEEP):**
- Location: `app/components/finance/FinancePlotlyCharts.tsx`
- Size: 8,243 bytes
- Status: ✅ **IN USE**
- Used by:
  - `CashFlowStatement.tsx` (imports from `./FinancePlotlyCharts`)
  - `FinanceDashboard.tsx` (imports from `./FinancePlotlyCharts`)
  - `app/components/finance/index.ts` (exports from `./FinancePlotlyCharts`)

**Duplicate Version (REMOVE):**
- Location: `app/components/finance/charts/FinancePlotlyCharts.tsx`
- Size: 9,187 bytes
- Status: ⚠️ **UNUSED**
- Only referenced by: `app/components/finance/charts/index.ts`
- `charts/index.ts` is **NOT imported anywhere** in the codebase

## 🧹 Cleanup Actions

### Option 1: Remove Entire charts/ Subdirectory (Recommended)
Since `charts/index.ts` is not used anywhere, we can safely remove:
- `app/components/finance/charts/FinancePlotlyCharts.tsx`
- `app/components/finance/charts/index.ts`
- `app/components/finance/charts/` directory (if empty after removal)

### Option 2: Keep charts/ for Future Use
If you plan to use the charts subdirectory structure in the future, you can:
- Keep the directory but remove the duplicate file
- Update `charts/index.ts` to re-export from the main file

## ✅ Verification

Before removal, verify:
1. ✅ No imports from `charts/index.ts` found
2. ✅ No imports from `charts/FinancePlotlyCharts.tsx` found
3. ✅ All active imports use `./FinancePlotlyCharts` (main file)

## 🚀 Recommended Action

**Remove the duplicate:**
```bash
# Remove the unused duplicate
rm app/components/finance/charts/FinancePlotlyCharts.tsx
rm app/components/finance/charts/index.ts
rmdir app/components/finance/charts  # If directory is empty
```

This will:
- ✅ Eliminate confusion about which file to use
- ✅ Reduce codebase size
- ✅ Prevent future merge conflicts
- ✅ Keep only the actively used version

