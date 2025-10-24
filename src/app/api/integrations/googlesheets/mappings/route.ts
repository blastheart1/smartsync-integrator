import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  console.log('[GOOGLE_MAPPINGS_API] Starting GET request');
  
  try {
    console.log('[GOOGLE_MAPPINGS_API] Initializing Prisma client');
    const prisma = new PrismaClient();
    
    console.log('[GOOGLE_MAPPINGS_API] Getting userId from session (hardcoded for now)');
    const userId = "1";
    
    console.log('[GOOGLE_MAPPINGS_API] Querying database for integration mappings');
    const mappings = await prisma.integrationMapping.findMany({
      where: { userId },
      include: {
        sourceAccount: {
          select: {
            email: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`[GOOGLE_MAPPINGS_API] Found ${mappings.length} integration mappings`);
    console.log('[GOOGLE_MAPPINGS_API] Mappings data:', JSON.stringify(mappings, null, 2));
    
    await prisma.$disconnect();
    console.log('[GOOGLE_MAPPINGS_API] Database connection closed');
    
    return NextResponse.json({
      success: true,
      data: mappings
    });
    
  } catch (error) {
    console.error('[GOOGLE_MAPPINGS_API] Error occurred:', error);
    console.error('[GOOGLE_MAPPINGS_API] Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('[GOOGLE_MAPPINGS_API] Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('[GOOGLE_MAPPINGS_API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list integration mappings' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('➕ Google Sheets API - Create Integration Mapping');
    
    const body = await request.json();
    const {
      name,
      sourceSpreadsheetId,
      sourceRange,
      targetType,
      targetEntity,
      fieldMappings,
      syncFrequency = 'hourly',
      triggerType = 'schedule'
    } = body;
    
    if (!name || !sourceSpreadsheetId || !targetType || !targetEntity || !fieldMappings) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // TODO: Get userId from session/auth
    const userId = "1";
    
    // Get active Google account
    const activeAccount = await prisma.googleAccount.findFirst({
      where: { 
        userId,
        isActive: true 
      }
    });
    
    if (!activeAccount) {
      return NextResponse.json(
        { success: false, error: 'No active Google account found' },
        { status: 400 }
      );
    }
    
    const mapping = await prisma.integrationMapping.create({
      data: {
        userId,
        name,
        sourceType: 'googlesheets',
        sourceAccountId: activeAccount.id,
        sourceSpreadsheetId,
        sourceRange,
        targetType,
        targetEntity,
        fieldMappings,
        syncFrequency,
        triggerType,
        isActive: true
      }
    });
    
    console.log('✅ Created integration mapping:', mapping.id);
    
    return NextResponse.json({
      success: true,
      data: mapping
    });
    
  } catch (error) {
    console.error('❌ Error creating integration mapping:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create integration mapping' 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log('✏️ Google Sheets API - Update Integration Mapping');
    
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Mapping ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Get userId from session/auth
    const userId = "1";
    
    const mapping = await prisma.integrationMapping.updateMany({
      where: { 
        id,
        userId // Ensure user can only update their own mappings
      },
      data: updateData
    });
    
    if (mapping.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Mapping not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Updated integration mapping:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Mapping updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Error updating integration mapping:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update integration mapping' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️ Google Sheets API - Delete Integration Mapping');
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Mapping ID is required' },
        { status: 400 }
      );
    }
    
    // TODO: Get userId from session/auth
    const userId = "1";
    
    const mapping = await prisma.integrationMapping.deleteMany({
      where: { 
        id,
        userId // Ensure user can only delete their own mappings
      }
    });
    
    if (mapping.count === 0) {
      return NextResponse.json(
        { success: false, error: 'Mapping not found' },
        { status: 404 }
      );
    }
    
    console.log('✅ Deleted integration mapping:', id);
    
    return NextResponse.json({
      success: true,
      message: 'Mapping deleted successfully'
    });
    
  } catch (error) {
    console.error('❌ Error deleting integration mapping:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete integration mapping' 
      },
      { status: 500 }
    );
  }
}
