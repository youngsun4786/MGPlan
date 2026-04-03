import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { getRequest } from '@tanstack/react-start/server'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import { screenshotInputSchema } from '~/lib/schemas'

export const uploadScreenshot = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(screenshotInputSchema))
  .handler(async ({ data }): Promise<{ success: true; screenshotUrl: string } | { success: false; error: string }> => {
    const request = getRequest()
    const supabase = getSupabaseServerClient(request.headers)

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    try {
      const fileName = `${crypto.randomUUID()}.jpg`
      const buffer = Buffer.from(data.imageBase64, 'base64')

      const uploadResult = await supabase.storage
        .from('screenshots')
        .upload(fileName, buffer, { contentType: data.mediaType, upsert: false })

      if (uploadResult.error) {
        console.error('[screenshot] Storage upload failed:', uploadResult.error.message)
        return { success: false, error: 'Failed to upload image. Please try again.' }
      }

      const { data: signedUrlData } = await supabase.storage
        .from('screenshots')
        .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry

      return {
        success: true,
        screenshotUrl: signedUrlData?.signedUrl ?? '',
      }
    } catch (error) {
      console.error('[screenshot] Upload failed:', error)
      return { success: false, error: 'Failed to upload image. Please try again.' }
    }
  })
