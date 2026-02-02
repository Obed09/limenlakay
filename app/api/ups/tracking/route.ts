import { NextRequest, NextResponse } from "next/server";

/**
 * UPS Tracking API Endpoint
 * Fetches real-time tracking information from UPS
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const trackingNumber = searchParams.get("trackingNumber");

    if (!trackingNumber) {
      return NextResponse.json(
        { error: "Tracking number is required" },
        { status: 400 }
      );
    }

    // Get UPS access token
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ups/token`);
    
    if (!tokenResponse.ok) {
      throw new Error("Failed to get UPS access token");
    }

    const { access_token } = await tokenResponse.json();

    // Fetch tracking information
    const trackingResponse = await fetch(
      `https://onlinetools.ups.com/api/track/v1/details/${trackingNumber}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
          "transId": `track-${Date.now()}`,
          "transactionSrc": "limenlakay",
        },
      }
    );

    if (!trackingResponse.ok) {
      const errorText = await trackingResponse.text();
      console.error("UPS Tracking Error:", errorText);
      
      // Return null if not found - will fallback to manual tracking
      if (trackingResponse.status === 404) {
        return NextResponse.json({ found: false, trackingNumber });
      }

      return NextResponse.json(
        { error: "Failed to fetch tracking information", details: errorText },
        { status: trackingResponse.status }
      );
    }

    const trackingData = await trackingResponse.json();
    
    // Parse UPS response into our format
    const shipment = trackingData.trackResponse?.shipment?.[0];
    
    if (!shipment) {
      return NextResponse.json({ found: false, trackingNumber });
    }

    const activity = shipment.package?.[0]?.activity || [];
    const currentStatus = activity[0]?.status?.description || "In Transit";
    const deliveryDate = shipment.package?.[0]?.deliveryDate?.[0];
    const deliveryTime = shipment.package?.[0]?.deliveryTime;

    // Map UPS activities to our tracking events format
    const trackingEvents = activity.map((act: any) => ({
      date: act.date,
      time: act.time,
      location: `${act.location?.address?.city || ""}, ${act.location?.address?.stateProvince || ""}`.trim(),
      status: act.status?.description || "Update",
      description: act.status?.statusCode || "",
    }));

    return NextResponse.json({
      found: true,
      trackingNumber,
      status: currentStatus,
      estimatedDelivery: deliveryDate ? `${deliveryDate.date} ${deliveryTime?.startTime || ""}`.trim() : null,
      carrier: "UPS",
      shipment: {
        service: shipment.service?.description || "UPS Ground",
        weight: shipment.package?.[0]?.weight?.weight,
        weightUnit: shipment.package?.[0]?.weight?.unitOfMeasurement,
      },
      events: trackingEvents,
      raw: shipment, // Include raw data for debugging
    });
  } catch (error: any) {
    console.error("UPS Tracking API Error:", error);
    return NextResponse.json(
      { 
        found: false,
        error: "Failed to fetch tracking information",
        message: error.message 
      },
      { status: 500 }
    );
  }
}
