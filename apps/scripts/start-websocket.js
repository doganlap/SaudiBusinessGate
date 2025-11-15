#!/usr/bin/env node

/**
 * Start WebSocket Server Script
 * Saudi Store Platform
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting WebSocket Server...');

// Start the WebSocket server
const wsServer = spawn('node', ['-r', 'ts-node/register', path.join(__dirname, '../lib/websocket-server.ts')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || 'development',
    WS_PORT: process.env.WS_PORT || '3051'
  }
});

wsServer.on('error', (error) => {
  console.error('❌ Failed to start WebSocket server:', error);
  process.exit(1);
});

wsServer.on('close', (code) => {
  console.log(`🛑 WebSocket server exited with code ${code}`);
  process.exit(code);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Received SIGTERM, shutting down WebSocket server...');
  wsServer.kill('SIGTERM');
});

process.on('SIGINT', () => {
  console.log('🔄 Received SIGINT, shutting down WebSocket server...');
  wsServer.kill('SIGINT');
});
