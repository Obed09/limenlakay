import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('workshop_settings')
      .select('*')
      .single()

    if (error) throw error

    return NextResponse.json({
      success: true,
      settings: data
    })
  } catch (error: any) {
    console.error('Error fetching workshop settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        // Default settings if table doesn't exist yet
        settings: {
          registration_enabled: true,
          closed_message: 'Unfortunately, registration is closed at this time. Please check back for the next session.'
        }
      },
      { status: 200 } // Return 200 with default settings instead of error
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { registration_enabled, closed_message } = body

    // Get the existing settings
    const { data: existing } = await supabase
      .from('workshop_settings')
      .select('id')
      .single()

    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('workshop_settings')
        .update({
          registration_enabled,
          closed_message,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        settings: data,
        message: 'Workshop settings updated successfully'
      })
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('workshop_settings')
        .insert({
          registration_enabled,
          closed_message
        })
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({
        success: true,
        settings: data,
        message: 'Workshop settings created successfully'
      })
    }
  } catch (error: any) {
    console.error('Error updating workshop settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    )
  }
}
