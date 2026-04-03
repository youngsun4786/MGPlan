import { createServerFn } from '@tanstack/react-start'
import { zodValidator } from '@tanstack/zod-adapter'
import { getRequest } from '@tanstack/react-start/server'
import { getSupabaseServerClient } from '~/lib/supabase.server'
import { z } from 'zod'

const pushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

export const savePushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(pushSubscriptionSchema))
  .handler(async ({ data }) => {
    const request = getRequest()
    const supabase = getSupabaseServerClient(request.headers)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        staff_id: user.id,
        endpoint: data.endpoint,
        p256dh: data.keys.p256dh,
        auth: data.keys.auth,
      },
      { onConflict: 'endpoint' },
    )

    if (error) throw new Error(error.message)
    return { success: true }
  })

export const deletePushSubscription = createServerFn({ method: 'POST' })
  .inputValidator(zodValidator(z.object({ endpoint: z.string().url() })))
  .handler(async ({ data }) => {
    const request = getRequest()
    const supabase = getSupabaseServerClient(request.headers)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', data.endpoint)
      .eq('staff_id', user.id)

    if (error) throw new Error(error.message)
    return { success: true }
  })
