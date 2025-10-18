import { NextResponse } from "next/server";

// Define allowed event types for security
const ALLOWED_EVENTS = [
  'new_customer',
  'new_invoice', 
  'invoice_paid',
  'payment_received',
  'customer_updated',
  'invoice_updated',
  'test_event'
];

interface ZapierPayload {
  event: string;
  data: any;
  source?: string;
  timestamp?: string;
}

export async function POST(req: Request) {
  try {
    const payload: ZapierPayload = await req.json();
    
    // Validate payload structure
    if (!payload.event || !payload.data) {
      return NextResponse.json({ 
        error: "Invalid payload structure. Required: event, data" 
      }, { status: 400 });
    }

    // Validate event type for security
    if (!ALLOWED_EVENTS.includes(payload.event)) {
      return NextResponse.json({ 
        error: `Invalid event type. Allowed: ${ALLOWED_EVENTS.join(', ')}` 
      }, { status: 400 });
    }

    // Get Zapier webhook URL from environment
    const zapierHook = process.env.ZAPIER_HOOK_URL;
    
    if (!zapierHook) {
      console.error('ZAPIER_HOOK_URL not configured');
      return NextResponse.json({ 
        error: "Zapier webhook URL not configured" 
      }, { status: 500 });
    }

    // Enhance payload with metadata
    const enhancedPayload = {
      ...payload,
      source: 'smartsync_integrator',
      timestamp: new Date().toISOString(),
      version: '1.0'
    };

    // Log the webhook call (without sensitive data)
    console.log(`🔗 Sending Zapier webhook: ${payload.event}`, {
      event: payload.event,
      timestamp: enhancedPayload.timestamp,
      dataKeys: Object.keys(payload.data),
      webhookUrl: zapierHook.substring(0, 50) + '...' // Mask URL for security
    });

    // Send to Zapier webhook
    const res = await fetch(zapierHook, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "User-Agent": "SmartSync-Integrator/1.0"
      },
      body: JSON.stringify(enhancedPayload),
    });

    if (!res.ok) {
      console.error(`Zapier webhook failed: ${res.status} ${res.statusText}`);
      throw new Error(`Zapier webhook failed: ${res.status}`);
    }

    console.log(`✅ Zapier webhook sent successfully: ${payload.event}`);
    
    return NextResponse.json({ 
      success: true, 
      event: payload.event,
      timestamp: enhancedPayload.timestamp
    });

  } catch (error) {
    console.error('Zapier webhook error:', error);
    
    // Don't leak internal error details
    return NextResponse.json({ 
      error: "Zapier automation failed" 
    }, { status: 500 });
  }
}

// Add GET method for webhook testing/status
export async function GET() {
  const zapierHook = process.env.ZAPIER_HOOK_URL;
  
  return NextResponse.json({
    status: zapierHook ? "configured" : "not_configured",
    allowed_events: ALLOWED_EVENTS,
    webhook_configured: !!zapierHook,
    version: "1.0"
  });
}
