#!/usr/bin/env node

const { spawn } = require('child_process');
const net = require('net');

/**
 * فحص إذا كان المنفذ متاح
 */
function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true); // المنفذ متاح
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false); // المنفذ مشغول
    });
  });
}

/**
 * العثور على منفذ متاح
 */
async function findAvailablePort(startPort = 3000) {
  let port = startPort;
  
  while (port < startPort + 100) {
    const isAvailable = await checkPort(port);
    if (isAvailable) {
      return port;
    }
    port++;
  }
  
  throw new Error('لم يتم العثور على منفذ متاح');
}

/**
 * تشغيل الخادم
 */
async function startServer() {
  try {
    console.log('🔍 البحث عن منفذ متاح...');
    
    const port = await findAvailablePort(3000);
    
    console.log(`🚀 تشغيل الخادم على المنفذ ${port}`);
    console.log(`🌐 الرابط: http://localhost:${port}`);
    console.log(`🌐 الرابط العربي: http://localhost:${port}/ar/auth`);
    console.log('-----------------------------------');
    
    // تشغيل Next.js مع المنفذ المحدد
    const child = spawn('npx', ['next', 'dev', '-p', port.toString()], {
      stdio: 'inherit',
      shell: true
    });
    
    // التعامل مع إشارات النظام
    process.on('SIGINT', () => {
      console.log('\n🛑 إيقاف الخادم...');
      child.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      child.kill('SIGTERM');
      process.exit(0);
    });
    
    child.on('error', (error) => {
      console.error('❌ خطأ في تشغيل الخادم:', error.message);
      process.exit(1);
    });
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

// تشغيل السكريبت
if (require.main === module) {
  startServer();
}

module.exports = { findAvailablePort, checkPort };
