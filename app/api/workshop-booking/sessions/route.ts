import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Fetch all workshop sessions
export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: sessions, error } = await supabase
      .from("workshop_sessions")
      .select("*")
      .order("session_date", { ascending: true });
    
    if (error) {
      console.error("Error fetching sessions:", error);
      return NextResponse.json(
        { error: "Failed to fetch sessions" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ sessions }, { status: 200 });
  } catch (error) {
    console.error("Sessions fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Create a new workshop session
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { session_date, session_time, meeting_link, max_participants = 5 } = body;
    
    if (!session_date || !session_time || !meeting_link) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from("workshop_sessions")
      .insert([
        {
          session_date,
          session_time,
          meeting_link,
          max_participants,
          current_participants: 0,
          status: "open",
        },
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error creating session:", error);
      return NextResponse.json(
        { error: "Failed to create session" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, session: data },
      { status: 201 }
    );
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT: Update a workshop session
export async function PUT(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { id, session_date, session_time, meeting_link, status } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }
    
    const updateData: any = {};
    if (session_date) updateData.session_date = session_date;
    if (session_time) updateData.session_time = session_time;
    if (meeting_link) updateData.meeting_link = meeting_link;
    if (status) updateData.status = status;
    
    const { data, error } = await supabase
      .from("workshop_sessions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating session:", error);
      return NextResponse.json(
        { error: "Failed to update session" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, session: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a workshop session
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    
    if (!id) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }
    
    const { error } = await supabase
      .from("workshop_sessions")
      .delete()
      .eq("id", id);
    
    if (error) {
      console.error("Error deleting session:", error);
      return NextResponse.json(
        { error: "Failed to delete session" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, message: "Session deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session deletion error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH: Toggle session registration on/off
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    
    const { session_id, registration_enabled } = body;
    
    if (!session_id || registration_enabled === undefined) {
      return NextResponse.json(
        { error: "Session ID and registration_enabled are required" },
        { status: 400 }
      );
    }
    
    const { data, error } = await supabase
      .from("workshop_sessions")
      .update({ registration_enabled })
      .eq("id", session_id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating session registration:", error);
      return NextResponse.json(
        { error: "Failed to update session registration" },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: true, session: data },
      { status: 200 }
    );
  } catch (error) {
    console.error("Session registration update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
