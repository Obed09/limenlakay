import { NextRequest, NextResponse } from 'next/server'

/**
 * Post to Facebook Page
 * Publishes a photo with caption to a Facebook Page
 */

export async function POST(request: NextRequest) {
  try {
    const {
      pageAccessToken, // Use page access token, not user token
      pageId,
      imageUrl,
      caption,
      link, // Optional: link to include
      published = true, // Set to false to create unpublished/scheduled post
    } = await request.json()

    if (!pageAccessToken || !pageId || !imageUrl || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields: pageAccessToken, pageId, imageUrl, caption' },
        { status: 400 }
      )
    }

    // Post photo to Facebook Page
    const params = new URLSearchParams({
      url: imageUrl,
      caption: caption,
      published: published.toString(),
      access_token: pageAccessToken,
    })

    if (link) {
      params.append('link', link)
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}/photos?${params}`,
      { method: 'POST' }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Failed to post to Facebook')
    }

    const data = await response.json()
    const postId = data.post_id || data.id

    // Get post details including permalink
    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=permalink_url&access_token=${pageAccessToken}`
    )

    const postData = await postResponse.json()

    return NextResponse.json({
      success: true,
      postId: postId,
      permalink: postData.permalink_url,
      message: 'Successfully posted to Facebook!'
    })

  } catch (error: any) {
    console.error('Facebook post error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to post to Facebook',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
