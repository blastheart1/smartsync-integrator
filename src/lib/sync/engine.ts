import { PrismaClient } from "@/generated/prisma";
import { readRange } from "@/lib/integrations/googlesheets";

const prisma = new PrismaClient();

export interface SyncResult {
  success: boolean;
  rowsProcessed: number;
  rowsFailed: number;
  error?: string;
  details?: any;
}

export interface SyncContext {
  mappingId: string;
  mapping: any;
  sourceAccount: any;
  userId: string;
}

export class SyncEngine {
  constructor() {
    // No initialization needed for function-based approach
  }

  /**
   * Execute a sync for a specific mapping
   */
  async executeSync(mappingId: string): Promise<SyncResult> {
    const context = await this.prepareSyncContext(mappingId);
    if (!context) {
      return {
        success: false,
        rowsProcessed: 0,
        rowsFailed: 0,
        error: "Failed to prepare sync context"
      };
    }

    // Create sync log entry
    const syncLog = await this.createSyncLog(context.mappingId);

    try {
      // Fetch source data
      const sourceData = await this.fetchSourceData(context);
      
      // Transform data based on field mappings
      const transformedData = this.transformData(sourceData, context.mapping.fieldMappings);
      
      // Validate transformed data
      const validationResult = this.validateData(transformedData, context.mapping);
      if (!validationResult.isValid) {
        throw new Error(`Validation failed: ${validationResult.errors.join(", ")}`);
      }
      
      // Write to target system
      const writeResult = await this.writeToTarget(transformedData, context);
      
      // Update sync log with success
      await this.updateSyncLog(syncLog.id, {
        status: "success",
        completedAt: new Date(),
        rowsProcessed: writeResult.rowsProcessed,
        rowsFailed: writeResult.rowsFailed
      });
      
      // Update mapping with sync count
      await this.updateMappingSyncCount(context.mappingId, writeResult.rowsProcessed);
      
      return {
        success: true,
        rowsProcessed: writeResult.rowsProcessed,
        rowsFailed: writeResult.rowsFailed,
        details: writeResult.details
      };
      
    } catch (error) {
      // Update sync log with error
      await this.updateSyncLog(syncLog.id, {
        status: "error",
        completedAt: new Date(),
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        errorDetails: error
      });
      
      return {
        success: false,
        rowsProcessed: 0,
        rowsFailed: 0,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  /**
   * Prepare sync context by loading mapping and account data
   */
  private async prepareSyncContext(mappingId: string): Promise<SyncContext | null> {
    try {
      const mapping = await prisma.integrationMapping.findUnique({
        where: { id: mappingId },
        include: {
          sourceAccount: true
        }
      });

      if (!mapping || !mapping.isActive) {
        throw new Error("Mapping not found or inactive");
      }

      if (!mapping.sourceAccount) {
        throw new Error("Source account not found");
      }

      return {
        mappingId,
        mapping,
        sourceAccount: mapping.sourceAccount,
        userId: mapping.userId
      };
    } catch (error) {
      console.error("Failed to prepare sync context:", error);
      return null;
    }
  }

  /**
   * Fetch data from source (Google Sheets)
   */
  private async fetchSourceData(context: SyncContext): Promise<any[]> {
    const { mapping } = context;
    
    // Fetch data from the specified range using the readRange function
    const rangeData = await readRange(
      mapping.sourceSpreadsheetId,
      mapping.sourceRange || "A:Z",
      context.userId
    );
    
    if (!rangeData.values || rangeData.values.length === 0) {
      throw new Error("No data found in source spreadsheet");
    }
    
    // Use first row as headers
    const headers = rangeData.values[0];
    const rows = rangeData.values.slice(1);
    
    // Convert to objects with headers as keys
    return rows.map((row: any[]) => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        obj[header] = row[index] || "";
      });
      return obj;
    });
  }

  /**
   * Transform data based on field mappings
   */
  private transformData(sourceData: any[], fieldMappings: any[]): any[] {
    return sourceData.map(row => {
      const transformedRow: any = {};
      
      fieldMappings.forEach((mapping: any) => {
        if (mapping.sheetColumn && mapping.targetField) {
          const sourceValue = row[mapping.sheetColumn];
          transformedRow[mapping.targetField] = sourceValue;
        }
      });
      
      return transformedRow;
    });
  }

  /**
   * Validate transformed data against target requirements
   */
  private validateData(data: any[], mapping: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Get required fields from field mappings
    const requiredFields = mapping.fieldMappings
      .filter((m: any) => m.required)
      .map((m: any) => m.targetField);
    
    data.forEach((row, index) => {
      requiredFields.forEach((field: string) => {
        if (!row[field] || row[field].toString().trim() === "") {
          errors.push(`Row ${index + 1}: Missing required field "${field}"`);
        }
      });
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Write data to target system
   */
  private async writeToTarget(data: any[], context: SyncContext): Promise<{ rowsProcessed: number; rowsFailed: number; details: any }> {
    const { mapping } = context;
    
    // For now, we'll implement a simple mock that returns success
    // In a real implementation, this would call the appropriate target system API
    // (QuickBooks, HubSpot, Salesforce, etc.)
    
    console.log(`Writing ${data.length} rows to ${mapping.targetType} (${mapping.targetEntity})`);
    console.log("Sample data:", data.slice(0, 2));
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      rowsProcessed: data.length,
      rowsFailed: 0,
      details: {
        targetType: mapping.targetType,
        targetEntity: mapping.targetEntity,
        processedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Create sync log entry
   */
  private async createSyncLog(mappingId: string) {
    return await prisma.syncLog.create({
      data: {
        mappingId,
        status: "running",
        startedAt: new Date()
      }
    });
  }

  /**
   * Update sync log entry
   */
  private async updateSyncLog(syncLogId: string, updateData: any) {
    return await prisma.syncLog.update({
      where: { id: syncLogId },
      data: updateData
    });
  }

  /**
   * Update mapping sync count
   */
  private async updateMappingSyncCount(mappingId: string, rowsProcessed: number) {
    return await prisma.integrationMapping.update({
      where: { id: mappingId },
      data: {
        lastSync: new Date(),
        syncCount: {
          increment: rowsProcessed
        }
      }
    });
  }

  /**
   * Get sync status for a mapping
   */
  async getSyncStatus(mappingId: string): Promise<{
    isRunning: boolean;
    lastSync?: Date;
    nextSync?: Date;
    successRate?: number;
  }> {
    const mapping = await prisma.integrationMapping.findUnique({
      where: { id: mappingId },
      include: {
        syncLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!mapping) {
      throw new Error("Mapping not found");
    }

    // Check if there's a running sync
    const runningSync = await prisma.syncLog.findFirst({
      where: {
        mappingId,
        status: "running"
      }
    });

    // Calculate success rate from recent syncs
    const recentSyncs = mapping.syncLogs.filter(log => log.status !== "running");
    const successfulSyncs = recentSyncs.filter(log => log.status === "success");
    const successRate = recentSyncs.length > 0 ? (successfulSyncs.length / recentSyncs.length) * 100 : 0;

    // Calculate next sync time based on frequency
    let nextSync: Date | undefined;
    if (mapping.lastSync) {
      const lastSyncTime = new Date(mapping.lastSync);
      switch (mapping.syncFrequency) {
        case "hourly":
          nextSync = new Date(lastSyncTime.getTime() + 60 * 60 * 1000);
          break;
        case "daily":
          nextSync = new Date(lastSyncTime.getTime() + 24 * 60 * 60 * 1000);
          break;
        case "weekly":
          nextSync = new Date(lastSyncTime.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    return {
      isRunning: !!runningSync,
      lastSync: mapping.lastSync,
      nextSync,
      successRate
    };
  }
}

// Export singleton instance
export const syncEngine = new SyncEngine();
