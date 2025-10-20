import { PrismaClient } from "@/generated/prisma";
import { syncEngine } from "./engine";

const prisma = new PrismaClient();

export class SyncScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  /**
   * Start the scheduler
   */
  start() {
    if (this.isRunning) {
      console.log("Scheduler is already running");
      return;
    }

    console.log("🕐 Starting sync scheduler...");
    this.isRunning = true;

    // Check for scheduled syncs every minute
    this.intervalId = setInterval(async () => {
      await this.processScheduledSyncs();
    }, 60000); // 1 minute

    // Process immediately on start
    this.processScheduledSyncs();
  }

  /**
   * Stop the scheduler
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("⏹️ Sync scheduler stopped");
  }

  /**
   * Process scheduled syncs
   */
  private async processScheduledSyncs() {
    try {
      const now = new Date();
      
      // Find mappings that need to be synced
      const mappingsToSync = await this.getMappingsToSync(now);
      
      if (mappingsToSync.length === 0) {
        return;
      }

      console.log(`🔄 Found ${mappingsToSync.length} mappings to sync`);

      // Process each mapping
      for (const mapping of mappingsToSync) {
        await this.processMapping(mapping);
      }
    } catch (error) {
      console.error("❌ Error processing scheduled syncs:", error);
    }
  }

  /**
   * Get mappings that should be synced now
   */
  private async getMappingsToSync(now: Date) {
    const mappings = await prisma.integrationMapping.findMany({
      where: {
        isActive: true,
        triggerType: "schedule"
      },
      include: {
        sourceAccount: true
      }
    });

    return mappings.filter(mapping => {
      if (!mapping.lastSync) {
        // First sync - always eligible
        return true;
      }

      const lastSyncTime = new Date(mapping.lastSync);
      const timeSinceLastSync = now.getTime() - lastSyncTime.getTime();
      
      switch (mapping.syncFrequency) {
        case "hourly":
          return timeSinceLastSync >= 60 * 60 * 1000; // 1 hour
        case "daily":
          return timeSinceLastSync >= 24 * 60 * 60 * 1000; // 1 day
        case "weekly":
          return timeSinceLastSync >= 7 * 24 * 60 * 60 * 1000; // 1 week
        case "realtime":
          return false; // Real-time syncs are handled by webhooks
        default:
          return false;
      }
    });
  }

  /**
   * Process a single mapping
   */
  private async processMapping(mapping: any) {
    try {
      console.log(`🔄 Processing sync for mapping: ${mapping.name}`);
      
      // Check if sync is already running
      const runningSync = await prisma.syncLog.findFirst({
        where: {
          mappingId: mapping.id,
          status: "running"
        }
      });

      if (runningSync) {
        console.log(`⏳ Sync already running for mapping: ${mapping.name}`);
        return;
      }

      // Execute the sync
      const result = await syncEngine.executeSync(mapping.id);
      
      if (result.success) {
        console.log(`✅ Sync completed for mapping: ${mapping.name} (${result.rowsProcessed} rows)`);
      } else {
        console.error(`❌ Sync failed for mapping: ${mapping.name} - ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Error processing mapping ${mapping.name}:`, error);
    }
  }

  /**
   * Schedule a one-time sync
   */
  async scheduleSync(mappingId: string, scheduledFor: Date) {
    try {
      await prisma.syncJob.create({
        data: {
          mappingId,
          scheduledFor,
          status: "pending"
        }
      });
      
      console.log(`📅 Scheduled sync for mapping ${mappingId} at ${scheduledFor.toISOString()}`);
    } catch (error) {
      console.error("❌ Error scheduling sync:", error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled sync
   */
  async cancelScheduledSync(mappingId: string) {
    try {
      await prisma.syncJob.updateMany({
        where: {
          mappingId,
          status: "pending"
        },
        data: {
          status: "failed"
        }
      });
      
      console.log(`❌ Cancelled scheduled sync for mapping ${mappingId}`);
    } catch (error) {
      console.error("❌ Error cancelling scheduled sync:", error);
      throw error;
    }
  }
}

// Export singleton instance
export const syncScheduler = new SyncScheduler();
