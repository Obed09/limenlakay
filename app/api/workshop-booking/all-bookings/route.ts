import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

// GET: Fetch all workshop bookings (admin only)
export async function GET() {
  try {
    const supabase = createServiceClient();
    
    const { data: bookings, error } = await supabase
      .from("workshop_bookings")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching bookings:", error);
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Bookings fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
