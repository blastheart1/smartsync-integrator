// Zapier integration utilities
// Handles webhook triggering for QuickBooks events

interface ZapierEventData {
  event: string;
  data: any;
  source?: string;
  timestamp?: string;
}

// Allowed event types for security
const ALLOWED_EVENTS = [
  'new_customer',
  'new_invoice', 
  'invoice_paid',
  'payment_received',
  'customer_updated',
  'invoice_updated',
  'test_event'
];

/**
 * Trigger a Zapier webhook with event data
 * @param event - The event type (must be in ALLOWED_EVENTS)
 * @param data - The event data payload
 * @returns Promise with success/error result
 */
export async function triggerZapierWebhook(event: string, data: any): Promise<{
  success: boolean;
  error?: string;
  timestamp?: string;
}> {
  try {
    // Validate event type
    if (!ALLOWED_EVENTS.includes(event)) {
      console.error(`Invalid Zapier event type: ${event}`);
      return {
        success: false,
        error: `Invalid event type: ${event}`
      };
    }

    // Get webhook URL from environment
    const zapierHook = process.env.ZAPIER_HOOK_URL;
    
    if (!zapierHook) {
      console.error('ZAPIER_HOOK_URL not configured');
      return {
        success: false,
        error: 'Zapier webhook URL not configured'
      };
    }

    // Prepare payload
    const payload: ZapierEventData = {
      event,
      data,
      source: 'smartsync_integrator',
      timestamp: new Date().toISOString()
    };

    // Log webhook attempt (without sensitive data)
    console.log(`🔗 Triggering Zapier webhook: ${event}`, {
      event,
      timestamp: payload.timestamp,
      dataKeys: Object.keys(data),
      webhookUrl: zapierHook.substring(0, 50) + '...' // Mask URL for security
    });

    // Send webhook
    const response = await fetch(zapierHook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'SmartSync-Integrator/1.0'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      console.error(`Zapier webhook failed: ${response.status} ${response.statusText}`);
      return {
        success: false,
        error: `Webhook failed: ${response.status}`
      };
    }

    console.log(`✅ Zapier webhook sent successfully: ${event}`);
    
    return {
      success: true,
      timestamp: payload.timestamp
    };

  } catch (error) {
    console.error('Zapier webhook error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Trigger webhook for new QuickBooks customer
 */
export async function triggerNewCustomerWebhook(customerData: any): Promise<boolean> {
  const result = await triggerZapierWebhook('new_customer', {
    customer_id: customerData.Id,
    customer_name: customerData.DisplayName,
    email: customerData.PrimaryEmailAddr?.Address,
    phone: customerData.PrimaryPhone?.FreeFormNumber,
    company: customerData.CompanyName,
    created_date: customerData.MetaData?.CreateTime,
    sync_timestamp: new Date().toISOString()
  });
  
  return result.success;
}

/**
 * Trigger webhook for new QuickBooks invoice
 */
export async function triggerNewInvoiceWebhook(invoiceData: any): Promise<boolean> {
  const result = await triggerZapierWebhook('new_invoice', {
    invoice_id: invoiceData.Id,
    invoice_number: invoiceData.DocNumber,
    customer_name: invoiceData.CustomerRef?.name,
    customer_id: invoiceData.CustomerRef?.value,
    total_amount: invoiceData.TotalAmt,
    due_date: invoiceData.DueDate,
    balance: invoiceData.Balance,
    created_date: invoiceData.MetaData?.CreateTime,
    sync_timestamp: new Date().toISOString()
  });
  
  return result.success;
}

/**
 * Trigger webhook for invoice payment
 */
export async function triggerInvoicePaidWebhook(paymentData: any, invoiceData: any): Promise<boolean> {
  const result = await triggerZapierWebhook('invoice_paid', {
    payment_id: paymentData.Id,
    payment_amount: paymentData.TotalAmt,
    payment_date: paymentData.TxnDate,
    payment_method: paymentData.PaymentMethodRef?.name,
    invoice_id: invoiceData?.Id,
    invoice_number: invoiceData?.DocNumber,
    customer_name: paymentData.CustomerRef?.name,
    customer_id: paymentData.CustomerRef?.value,
    sync_timestamp: new Date().toISOString()
  });
  
  return result.success;
}

/**
 * Trigger webhook for payment received
 */
export async function triggerPaymentReceivedWebhook(paymentData: any): Promise<boolean> {
  const result = await triggerZapierWebhook('payment_received', {
    payment_id: paymentData.Id,
    payment_amount: paymentData.TotalAmt,
    payment_date: paymentData.TxnDate,
    payment_method: paymentData.PaymentMethodRef?.name,
    customer_name: paymentData.CustomerRef?.name,
    customer_id: paymentData.CustomerRef?.value,
    reference_number: paymentData.PrivateNote,
    sync_timestamp: new Date().toISOString()
  });
  
  return result.success;
}

/**
 * Get allowed event types
 */
export function getAllowedEvents(): string[] {
  return [...ALLOWED_EVENTS];
}

/**
 * Check if event type is allowed
 */
export function isEventAllowed(event: string): boolean {
  return ALLOWED_EVENTS.includes(event);
}
