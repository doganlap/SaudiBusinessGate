/**
 * Test script to verify Excel export functionality with ExcelJS
 */

import ExcelJS from 'exceljs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testExcelExport() {
  console.log('🧪 Testing Excel export functionality with ExcelJS...\n');

  try {
    // Create test data
    const testData = [
      { Name: 'John Doe', Age: 30, City: 'New York', Salary: 50000 },
      { Name: 'Jane Smith', Age: 25, City: 'Los Angeles', Salary: 60000 },
      { Name: 'Bob Johnson', Age: 35, City: 'Chicago', Salary: 55000 },
    ];

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Data');

    // Set up columns
    worksheet.columns = [
      { header: 'Name', key: 'Name', width: 15 },
      { header: 'Age', key: 'Age', width: 10 },
      { header: 'City', key: 'City', width: 15 },
      { header: 'Salary', key: 'Salary', width: 12 },
    ];

    // Add rows
    testData.forEach(row => {
      worksheet.addRow(row);
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    // Save to file for verification
    const testDir = path.join(__dirname, '../test-outputs');
    await fs.mkdir(testDir, { recursive: true });
    const filePath = path.join(testDir, 'test-export.xlsx');
    await fs.writeFile(filePath, buffer);

    console.log('✅ Excel export test PASSED');
    console.log(`   - Created workbook with ${worksheet.rowCount} rows`);
    console.log(`   - Generated buffer of ${buffer.length} bytes`);
    console.log(`   - Saved test file to: ${filePath}`);
    console.log('\n✅ All Excel export tests passed!\n');

    // Clean up
    await fs.unlink(filePath).catch(() => {});

    return true;
  } catch (error) {
    console.error('❌ Excel export test FAILED');
    console.error('   Error:', error.message);
    console.error('   Stack:', error.stack);
    return false;
  }
}

// Run test
testExcelExport()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

