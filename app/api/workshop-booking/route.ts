import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      name,
      email,
      phone,
      workshopDate,
      packageType,
      packagePrice,
      cardNumber, // Note: In production, use a payment processor like Stripe
    } = body;

    // Validate required fields
    if (!name || !email || !phone || !workshopDate || !packageType) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Process payment through Stripe/PayPal
    // 2. Only save booking after successful payment
    // For now, we'll just save the booking data

    // Insert booking into database
    const { data: booking, error: bookingError } = await supabase
      .from("workshop_bookings")
      .insert([
        {
          name,
          email,
          phone,
          workshop_date: workshopDate,
          package_type: packageType,
          package_price: packagePrice,
          status: "confirmed", // In production, this would be 'pending' until payment is confirmed
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (bookingError) {
      console.error("Booking error:", bookingError);
      return NextResponse.json(
        { error: "Failed to create booking" },
        { status: 500 }
      );
    }

    // Fetch workshop session details for the selected date
    const { data: session } = await supabase
      .from("workshop_sessions")
      .select("*")
      .eq("session_date", workshopDate)
      .single();

    // Send confirmation email
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/workshop-booking/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          name,
          date: workshopDate,
          time: session?.session_time || 'TBD',
          meetingLink: session?.meeting_link || 'Link will be sent closer to the date',
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send confirmation email");
      }
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Don't fail the booking if email fails
    }

    return NextResponse.json(
      {
        success: true,
        booking,
        message: "Booking confirmed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Workshop booking error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter is required" },
        { status: 400 }
      );
    }

    // Fetch user's bookings
    const { data: bookings, error } = await supabase
      .from("workshop_bookings")
      .select("*")
      .eq("email", email)
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
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
