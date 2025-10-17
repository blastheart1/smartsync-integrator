import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const zapierHook = process.env.ZAPIER_HOOK_URL;
    const res = await fetch(zapierHook!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Zapier webhook failed");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Zapier automation failed" }, { status: 500 });
  }
}
