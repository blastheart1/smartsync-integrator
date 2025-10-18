import { NextResponse } from "next/server";
import { fetchQuickBooksData } from "@/lib/integrations/quickbooks";
import { 
  triggerNewCustomerWebhook, 
  triggerNewInvoiceWebhook, 
  triggerPaymentReceivedWebhook,
  getAllowedEvents 
} from "@/lib/integrations/zapier";

export async function POST(request: Request) {
  try {
    const { eventType, dataType, limit = 1 } = await request.json();
    
    console.log(`🔗 QuickBooks Zapier Webhook - Triggering ${eventType} for ${dataType}`);
    
    // Validate event type
    const allowedEvents = getAllowedEvents();
    if (!allowedEvents.includes(eventType)) {
      return NextResponse.json({ 
        error: `Invalid event type. Allowed: ${allowedEvents.join(', ')}` 
      }, { status: 400 });
    }

    let webhookTriggered = false;
    let results: any[] = [];

    // Fetch data based on event type
    switch (eventType) {
      case 'new_customer':
        const customersData = await fetchQuickBooksData(`query?query=select * from Customer STARTPOSITION 1 MAXRESULTS ${limit}`);
        if (customersData?.QueryResponse?.Customer) {
          results = Array.isArray(customersData.QueryResponse.Customer) 
            ? customersData.QueryResponse.Customer 
            : [customersData.QueryResponse.Customer];
          
          for (const customer of results) {
            webhookTriggered = await triggerNewCustomerWebhook(customer);
          }
        }
        break;

      case 'new_invoice':
        const invoicesData = await fetchQuickBooksData(`query?query=select * from Invoice STARTPOSITION 1 MAXRESULTS ${limit}`);
        if (invoicesData?.QueryResponse?.Invoice) {
          results = Array.isArray(invoicesData.QueryResponse.Invoice) 
            ? invoicesData.QueryResponse.Invoice 
            : [invoicesData.QueryResponse.Invoice];
          
          for (const invoice of results) {
            webhookTriggered = await triggerNewInvoiceWebhook(invoice);
          }
        }
        break;

      case 'payment_received':
        const paymentsData = await fetchQuickBooksData(`query?query=select * from Payment STARTPOSITION 1 MAXRESULTS ${limit}`);
        if (paymentsData?.QueryResponse?.Payment) {
          results = Array.isArray(paymentsData.QueryResponse.Payment) 
            ? paymentsData.QueryResponse.Payment 
            : [paymentsData.QueryResponse.Payment];
          
          for (const payment of results) {
            webhookTriggered = await triggerPaymentReceivedWebhook(payment);
          }
        }
        break;

      default:
        return NextResponse.json({ 
          error: `Event type ${eventType} not implemented for QuickBooks` 
        }, { status: 400 });
    }

    console.log(`✅ QuickBooks Zapier Webhook - ${eventType} triggered:`, {
      success: webhookTriggered,
      recordsFound: results.length,
      eventType,
      dataType
    });

    return NextResponse.json({
      success: webhookTriggered,
      eventType,
      dataType,
      recordsFound: results.length,
      records: results.map(r => ({
        id: r.Id,
        name: r.DisplayName || r.DocNumber || r.TotalAmt,
        timestamp: new Date().toISOString()
      }))
    });

  } catch (error) {
    console.error('❌ QuickBooks Zapier Webhook - Error:', error);
    return NextResponse.json({ 
      error: "Failed to trigger Zapier webhook",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    available_events: getAllowedEvents(),
    quickbooks_events: [
      'new_customer',
      'new_invoice', 
      'payment_received'
    ],
    usage: {
      method: 'POST',
      body: {
        eventType: 'new_customer | new_invoice | payment_received',
        dataType: 'customers | invoices | payments',
        limit: 'number (default: 1)'
      }
    }
  });
}
