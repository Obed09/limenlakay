import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html } = await req.json()

    // Get SMTP2GO API credentials from environment
    const SMTP2GO_API_KEY = Deno.env.get('SMTP2GO_API_KEY')
    const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'info@limenlakay.com'

    console.log('Email Config:', { apiKeySet: !!SMTP2GO_API_KEY, from: EMAIL_FROM, to })

    if (!SMTP2GO_API_KEY) {
      console.error('SMTP2GO_API_KEY not configured')
      throw new Error('Email service not configured')
    }

    // Send email using SMTP2GO HTTP API
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': SMTP2GO_API_KEY,
      },
      body: JSON.stringify({
        sender: EMAIL_FROM,
        to: [to],
        subject: subject,
        html_body: html,
      }),
    })

    const result = await response.json()
    console.log('SMTP2GO Response:', result)

    if (!response.ok || result.data?.error) {
      throw new Error(result.data?.error || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully', data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Email error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
