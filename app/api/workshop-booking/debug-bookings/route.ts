import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Debug endpoint to check bookings with service role
export async function GET() {
  try {
    const supabase = await createClient();
    
    // First, try to get bookings with current auth
    const { data: bookings, error, count } = await supabase
      .from("workshop_bookings")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false });
    
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    return NextResponse.json({ 
      bookings,
      count,
      error: error ? error.message : null,
      user: user ? {
        id: user.id,
        email: user.email,
        role: user.user_metadata?.role
      } : null,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error: any) {
    console.error("Debug bookings error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
