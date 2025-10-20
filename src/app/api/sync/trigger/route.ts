import { NextRequest, NextResponse } from "next/server";
import { syncEngine } from "@/lib/sync/engine";

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Sync API - Manual Trigger');
    
    const body = await request.json();
    const { mappingId } = body;
    
    if (!mappingId) {
      return NextResponse.json(
        { success: false, error: 'Mapping ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Add authentication check
    // const userId = getUserIdFromSession(request);
    // Verify user owns this mapping
    
    // Check if sync is already running
    const status = await syncEngine.getSyncStatus(mappingId);
    if (status.isRunning) {
      return NextResponse.json(
        { success: false, error: 'Sync is already running for this mapping' },
        { status: 409 }
      );
    }
    
    // Execute sync asynchronously
    // In a production environment, you'd want to use a job queue like Bull or Agenda
    // For now, we'll execute it directly
    const result = await syncEngine.executeSync(mappingId);
    
    if (result.success) {
      console.log(`✅ Sync completed successfully: ${result.rowsProcessed} rows processed`);
      return NextResponse.json({
        success: true,
        message: 'Sync completed successfully',
        data: {
          rowsProcessed: result.rowsProcessed,
          rowsFailed: result.rowsFailed,
          details: result.details
        }
      });
    } else {
      console.error(`❌ Sync failed: ${result.error}`);
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Sync failed',
          data: {
            rowsProcessed: result.rowsProcessed,
            rowsFailed: result.rowsFailed
          }
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('❌ Error triggering sync:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to trigger sync' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Sync API - Get Status');
    
    const { searchParams } = new URL(request.url);
    const mappingId = searchParams.get('mappingId');
    
    if (!mappingId) {
      return NextResponse.json(
        { success: false, error: 'Mapping ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Add authentication check
    
    const status = await syncEngine.getSyncStatus(mappingId);
    
    return NextResponse.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    console.error('❌ Error getting sync status:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sync status' 
      },
      { status: 500 }
    );
  }
}
