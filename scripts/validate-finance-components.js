// Validation script for finance components
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Validating Finance Components...\n');

const projectRoot = path.join(__dirname, '..');
const componentsPath = path.join(projectRoot, 'app', 'components', 'finance');

// Check if FinancePlotlyCharts.tsx exists and has exports
const plotlyChartsPath = path.join(componentsPath, 'FinancePlotlyCharts.tsx');
if (fs.existsSync(plotlyChartsPath)) {
  console.log('✅ FinancePlotlyCharts.tsx exists');
  const content = fs.readFileSync(plotlyChartsPath, 'utf8');
  
  // Check for exports
  const hasCashFlowTrendChart = content.includes('export function CashFlowTrendChart');
  const hasCashFlowWaterfallChart = content.includes('export function CashFlowWaterfallChart');
  
  console.log(`   - CashFlowTrendChart: ${hasCashFlowTrendChart ? '✅' : '❌'}`);
  console.log(`   - CashFlowWaterfallChart: ${hasCashFlowWaterfallChart ? '✅' : '❌'}`);
  
  // Check for Plot component
  const hasPlotImport = content.includes("import('react-plotly.js')") || content.includes('from \'react-plotly.js\'');
  console.log(`   - Plotly import: ${hasPlotImport ? '✅' : '❌'}`);
} else {
  console.log('❌ FinancePlotlyCharts.tsx not found');
}

// Check CashFlowStatement imports
const cashFlowStatementPath = path.join(componentsPath, 'CashFlowStatement.tsx');
if (fs.existsSync(cashFlowStatementPath)) {
  console.log('\n✅ CashFlowStatement.tsx exists');
  const content = fs.readFileSync(cashFlowStatementPath, 'utf8');
  
  const hasImport = content.includes("from './FinancePlotlyCharts'");
  const usesTrendChart = content.includes('<CashFlowTrendChart');
  const usesWaterfallChart = content.includes('<CashFlowWaterfallChart');
  
  console.log(`   - Imports from FinancePlotlyCharts: ${hasImport ? '✅' : '❌'}`);
  console.log(`   - Uses CashFlowTrendChart: ${usesTrendChart ? '✅' : '❌'}`);
  console.log(`   - Uses CashFlowWaterfallChart: ${usesWaterfallChart ? '✅' : '❌'}`);
} else {
  console.log('\n❌ CashFlowStatement.tsx not found');
}

// Check index.ts exports
const indexPath = path.join(componentsPath, 'index.ts');
if (fs.existsSync(indexPath)) {
  console.log('\n✅ index.ts exists');
  const content = fs.readFileSync(indexPath, 'utf8');
  
  const exportsTrendChart = content.includes('CashFlowTrendChart');
  const exportsWaterfallChart = content.includes('CashFlowWaterfallChart');
  
  console.log(`   - Exports CashFlowTrendChart: ${exportsTrendChart ? '✅' : '❌'}`);
  console.log(`   - Exports CashFlowWaterfallChart: ${exportsWaterfallChart ? '✅' : '❌'}`);
} else {
  console.log('\n❌ index.ts not found');
}

// Check package.json dependencies
const packageJsonPath = path.join(projectRoot, 'package.json');
if (fs.existsSync(packageJsonPath)) {
  console.log('\n✅ package.json exists');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  
  const hasPlotly = !!deps['plotly.js'];
  const hasReactPlotly = !!deps['react-plotly.js'];
  const hasJspdf = !!deps['jspdf'];
  const hasJspdfAutotable = !!deps['jspdf-autotable'];
  
  console.log(`   - plotly.js: ${hasPlotly ? '✅' : '❌'} ${hasPlotly ? `(${deps['plotly.js']})` : ''}`);
  console.log(`   - react-plotly.js: ${hasReactPlotly ? '✅' : '❌'} ${hasReactPlotly ? `(${deps['react-plotly.js']})` : ''}`);
  console.log(`   - jspdf: ${hasJspdf ? '✅' : '❌'} ${hasJspdf ? `(${deps['jspdf']})` : ''}`);
  console.log(`   - jspdf-autotable: ${hasJspdfAutotable ? '✅' : '❌'} ${hasJspdfAutotable ? `(${deps['jspdf-autotable']})` : ''}`);
}

console.log('\n✅ Validation complete!\n');

