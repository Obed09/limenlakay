import { NextRequest, NextResponse } from "next/server";

/**
 * UPS Shipping Rate API Endpoint
 * Calculates real-time shipping costs using UPS Rating API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      toZip, 
      toCity, 
      toState, 
      toCountry = "US",
      weight = 2, // default 2 lbs
      service = "03" // 03 = Ground, 02 = 2nd Day Air, 01 = Next Day Air
    } = body;

    if (!toZip || !toState) {
      return NextResponse.json(
        { error: "Destination zip code and state are required" },
        { status: 400 }
      );
    }

    // Get UPS access token
    const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/ups/token`);
    
    if (!tokenResponse.ok) {
      throw new Error("Failed to get UPS access token");
    }

    const { access_token } = await tokenResponse.json();

    // Prepare rating request
    const ratingRequest = {
      RateRequest: {
        Request: {
          TransactionReference: {
            CustomerContext: "Rating Request"
          }
        },
        Shipment: {
          Shipper: {
            Name: "Limen Lakay",
            ShipperNumber: process.env.UPS_ACCOUNT_NUMBER,
            Address: {
              AddressLine: ["123 Business St"], // Replace with your actual address
              City: "Palm Beach",
              StateProvinceCode: "FL",
              PostalCode: "33401",
              CountryCode: "US"
            }
          },
          ShipTo: {
            Name: "Customer",
            Address: {
              City: toCity || "",
              StateProvinceCode: toState,
              PostalCode: toZip,
              CountryCode: toCountry
            }
          },
          ShipFrom: {
            Name: "Limen Lakay",
            Address: {
              AddressLine: ["123 Business St"],
              City: "Palm Beach",
              StateProvinceCode: "FL",
              PostalCode: "33401",
              CountryCode: "US"
            }
          },
          Service: {
            Code: service,
            Description: service === "03" ? "Ground" : service === "02" ? "2nd Day Air" : "Next Day Air"
          },
          Package: {
            PackagingType: {
              Code: "02", // Customer Supplied Package
              Description: "Package"
            },
            Dimensions: {
              UnitOfMeasurement: {
                Code: "IN",
                Description: "Inches"
              },
              Length: "12",
              Width: "8",
              Height: "6"
            },
            PackageWeight: {
              UnitOfMeasurement: {
                Code: "LBS",
                Description: "Pounds"
              },
              Weight: weight.toString()
            }
          }
        }
      }
    };

    // Call UPS Rating API
    const ratingResponse = await fetch(
      "https://onlinetools.ups.com/api/rating/v1/Rate",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
          "transId": `rate-${Date.now()}`,
          "transactionSrc": "limenlakay",
        },
        body: JSON.stringify(ratingRequest),
      }
    );

    if (!ratingResponse.ok) {
      const errorText = await ratingResponse.text();
      console.error("UPS Rating Error:", errorText);
      
      // Return fallback rate if API fails
      return NextResponse.json({
        success: false,
        fallback: true,
        cost: 8.99,
        service: "Standard Shipping",
        message: "Using standard rate"
      });
    }

    const ratingData = await ratingResponse.json();
    
    // Extract shipping cost from response
    const shipment = ratingData.RateResponse?.RatedShipment;
    
    if (!shipment) {
      // Fallback to standard rate
      return NextResponse.json({
        success: false,
        fallback: true,
        cost: 8.99,
        service: "Standard Shipping"
      });
    }

    const totalCharges = shipment.TotalCharges?.MonetaryValue || "8.99";
    const currency = shipment.TotalCharges?.CurrencyCode || "USD";
    const serviceDescription = shipment.Service?.Code === "03" ? "UPS Ground" : 
                              shipment.Service?.Code === "02" ? "UPS 2nd Day Air" : 
                              "UPS Next Day Air";

    return NextResponse.json({
      success: true,
      cost: parseFloat(totalCharges),
      currency,
      service: serviceDescription,
      estimatedDays: shipment.Service?.Code === "03" ? "3-5 business days" : 
                     shipment.Service?.Code === "02" ? "2 business days" : 
                     "1 business day"
    });
  } catch (error: any) {
    console.error("UPS Shipping Rate Error:", error);
    
    // Return fallback rate on error
    return NextResponse.json({
      success: false,
      fallback: true,
      cost: 8.99,
      service: "Standard Shipping",
      error: error.message
    });
  }
}
