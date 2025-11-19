import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'nodejs';
import SelfHealingAgent from '@/lib/agents/self-healing-agent';

let healingAgent: SelfHealingAgent | null = null;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start':
        return await startHealing();
      
      case 'stop':
        return await stopHealing();
      
      case 'status':
        return await getStatus();
      
      case 'heal_now':
        return await healNow();
      
      case 'get_log':
        return await getHealingLog();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Self-Healing API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

async function startHealing() {
  if (!healingAgent) {
    healingAgent = new SelfHealingAgent();
    await healingAgent.startSelfHealing();
  }

  return NextResponse.json({
    success: true,
    message: 'Self-healing agent started',
    status: 'running'
  });
}

async function stopHealing() {
  if (healingAgent) {
    healingAgent.stop();
    healingAgent = null;
  }

  return NextResponse.json({
    success: true,
    message: 'Self-healing agent stopped',
    status: 'stopped'
  });
}

async function getStatus() {
  return NextResponse.json({
    success: true,
    status: healingAgent ? 'running' : 'stopped',
    uptime: healingAgent ? 'Active' : 'Inactive'
  });
}

async function healNow() {
  if (!healingAgent) {
    healingAgent = new SelfHealingAgent();
  }

  await healingAgent.performHealthCheck();

  return NextResponse.json({
    success: true,
    message: 'Manual healing performed',
    log: healingAgent.getHealingLog().slice(-5) // آخر 5 إجراءات
  });
}

async function getHealingLog() {
  const log = healingAgent ? healingAgent.getHealingLog() : [];

  return NextResponse.json({
    success: true,
    log: log,
    count: log.length
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'status';

  try {
    switch (action) {
      case 'status':
        return await getStatus();
      
      case 'log':
        return await getHealingLog();
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
