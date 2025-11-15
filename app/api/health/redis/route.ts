import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const Redis = require('ioredis');
    const redis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6390'),
      password: process.env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      retryStrategy: () => null
    });

    await redis.connect();
    const pong = await redis.ping();
    await redis.quit();

    return NextResponse.json({
      status: 'healthy',
      service: 'redis',
      response: pong,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        service: 'redis',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
