import { NextRequest, NextResponse } from 'next/server'

/**
 * Meta (Facebook/Instagram) OAuth Callback Handler
 * Handles the OAuth redirect after user authorizes the app
 * Exchanges authorization code for access token
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    if (error) {
      return NextResponse.redirect(
        new URL(`/social-media-manager?error=${error}&description=${errorDescription}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code not provided' },
        { status: 400 }
      )
    }

    const appId = process.env.META_APP_ID
    const appSecret = process.env.META_APP_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL}/api/meta/oauth/callback`

    if (!appId || !appSecret) {
      return NextResponse.json(
        { error: 'Meta app credentials not configured' },
        { status: 500 }
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `client_id=${appId}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&client_secret=${appSecret}` +
      `&code=${code}`
    )

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      throw new Error(errorData.error?.message || 'Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    const shortLivedToken = tokenData.access_token

    // Exchange short-lived token for long-lived token (60 days)
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      `grant_type=fb_exchange_token` +
      `&client_id=${appId}` +
      `&client_secret=${appSecret}` +
      `&fb_exchange_token=${shortLivedToken}`
    )

    if (!longLivedTokenResponse.ok) {
      throw new Error('Failed to get long-lived token')
    }

    const longLivedTokenData = await longLivedTokenResponse.json()
    const accessToken = longLivedTokenData.access_token

    // Get user's Facebook Pages and Instagram accounts
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    )

    const pagesData = await pagesResponse.json()
    const pages = pagesData.data || []

    // Get Instagram account for the first page (you can let user choose later)
    let instagramAccountId = null
    let facebookPageId = null

    if (pages.length > 0) {
      facebookPageId = pages[0].id
      const pageAccessToken = pages[0].access_token

      // Get Instagram Business Account connected to this page
      const igResponse = await fetch(
        `https://graph.facebook.com/v18.0/${facebookPageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
      )

      const igData = await igResponse.json()
      instagramAccountId = igData.instagram_business_account?.id
    }

    // Store tokens securely (in production, encrypt these!)
    // For now, redirect to a page where user can save them
    const successUrl = new URL('/social-media-manager', request.url)
    successUrl.searchParams.set('meta_connected', 'true')
    successUrl.searchParams.set('access_token', accessToken)
    successUrl.searchParams.set('facebook_page_id', facebookPageId || '')
    successUrl.searchParams.set('instagram_account_id', instagramAccountId || '')
    
    return NextResponse.redirect(successUrl)

  } catch (error: any) {
    console.error('Meta OAuth error:', error)
    return NextResponse.redirect(
      new URL(`/social-media-manager?error=oauth_failed&description=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}
