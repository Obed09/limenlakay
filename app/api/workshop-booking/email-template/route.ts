import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch email template
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: template, error } = await supabase
      .from("email_templates")
      .select("*")
      .eq("template_name", "workshop_confirmation")
      .eq("is_active", true)
      .single();
    
    if (error) {
      console.error("Error fetching email template:", error);
      return NextResponse.json(
        { error: "Failed to fetch email template" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ template }, { status: 200 });
  } catch (error) {
    console.error("Email template error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update email template
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { subject, body: emailBody } = body;
    
    if (!subject || !emailBody) {
      return NextResponse.json(
        { error: "Subject and body are required" },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from("email_templates")
      .update({
        subject,
        body: emailBody,
        updated_at: new Date().toISOString(),
      })
      .eq("template_name", "workshop_confirmation")
      .select()
      .single();
    
    if (error) {
      console.error("Error updating email template:", error);
      return NextResponse.json(
        { error: "Failed to update email template" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, template: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email template update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
