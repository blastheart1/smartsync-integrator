import { NextResponse } from 'next/server';
import { forceRefreshBillComSession, getBillComSessionInfo, clearBillComSession } from '@/lib/integrations/billcom-auth';

export async function GET() {
  console.log('🔍 Bill.com session status requested');
  try {
    const info = getBillComSessionInfo();
    return NextResponse.json({ success: true, sessionInfo: info });
  } catch (error) {
    console.error('Error getting Bill.com session info:', error);
    return NextResponse.json({ success: false, message: 'Failed to get session info', error: (error as Error).message }, { status: 500 });
  }
}

export async function POST() {
  console.log('🔄 Manual Bill.com session refresh requested');
  try {
    const newSession = await forceRefreshBillComSession();
    return NextResponse.json({ 
      success: true, 
      message: 'Bill.com session refreshed successfully', 
      sessionInfo: {
        sessionId: `${newSession.sessionId.substring(0, 20)}...`,
        expiresAt: new Date(newSession.expiresAt).toISOString(),
        organizationId: newSession.organizationId,
        userId: newSession.userId
      }
    });
  } catch (error) {
    console.error('Error during manual Bill.com session refresh:', error);
    return NextResponse.json({ success: false, message: 'Failed to refresh Bill.com session', error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE() {
  console.log('🗑️ Bill.com session clear requested');
  try {
    clearBillComSession();
    return NextResponse.json({ success: true, message: 'Bill.com session cleared successfully' });
  } catch (error) {
    console.error('Error during Bill.com session clear:', error);
    return NextResponse.json({ success: false, message: 'Failed to clear Bill.com session', error: (error as Error).message }, { status: 500 });
  }
}
