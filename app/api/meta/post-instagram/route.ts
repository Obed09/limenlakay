import { NextRequest, NextResponse } from 'next/server'

/**
 * Post to Instagram
 * Creates a container (image upload) and publishes it as a post
 */

export async function POST(request: NextRequest) {
  try {
    const {
      accessToken,
      instagramAccountId,
      imageUrl,
      caption,
      locationId, // Optional: Instagram location ID
    } = await request.json()

    if (!accessToken || !instagramAccountId || !imageUrl || !caption) {
      return NextResponse.json(
        { error: 'Missing required fields: accessToken, instagramAccountId, imageUrl, caption' },
        { status: 400 }
      )
    }

    // Step 1: Create a media container (upload image)
    const containerParams = new URLSearchParams({
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken,
    })

    if (locationId) {
      containerParams.append('location_id', locationId)
    }

    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media?${containerParams}`,
      { method: 'POST' }
    )

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json()
      throw new Error(errorData.error?.message || 'Failed to create media container')
    }

    const containerData = await containerResponse.json()
    const creationId = containerData.id

    // Step 2: Publish the container (wait a moment for processing)
    await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay

    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish?` +
      `creation_id=${creationId}&access_token=${accessToken}`,
      { method: 'POST' }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      throw new Error(errorData.error?.message || 'Failed to publish post')
    }

    const publishData = await publishResponse.json()
    const postId = publishData.id

    // Get the permalink (actual Instagram post URL)
    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${postId}?fields=permalink&access_token=${accessToken}`
    )

    const postData = await postResponse.json()

    return NextResponse.json({
      success: true,
      postId: postId,
      permalink: postData.permalink,
      message: 'Successfully posted to Instagram!'
    })

  } catch (error: any) {
    console.error('Instagram post error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to post to Instagram',
        details: error.toString()
      },
      { status: 500 }
    )
  }
}
