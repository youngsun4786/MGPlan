import webpush from 'npm:web-push'
import { createClient } from 'npm:@supabase/supabase-js@2'

// NOTE: Using npm:web-push for VAPID-signed push dispatch.
// If this fails in Supabase Edge Functions due to Node crypto compat issues,
// replace with jsr:@negrel/webpush (Deno-native). See RESEARCH open questions.
//
// Fallback import:
//   import { buildPushPayload } from 'jsr:@negrel/webpush'
// Then replace webpush.setVapidDetails + webpush.sendNotification with:
//   const vapidKeys = {
//     subject: Deno.env.get('VAPID_SUBJECT')!,
//     publicKey: Deno.env.get('VAPID_PUBLIC_KEY')!,
//     privateKey: Deno.env.get('VAPID_PRIVATE_KEY')!,
//   }
//   const payload = await buildPushPayload(
//     { title: 'New Task', body: `${client_name} \u2014 ${request_type}` },
//     { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
//     vapidKeys,
//   )
//   await fetch(sub.endpoint, payload)

interface WebhookPayload {
  type: 'INSERT'
  table: string
  schema: string
  record: {
    id: string
    client_name: string
    request_type: string
    [key: string]: unknown
  }
  old_record: null
}

webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT')!,
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
)

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
)

Deno.serve(async (req) => {
  try {
    const payload = await req.json()
    console.log('Webhook payload:', JSON.stringify(payload, null, 2))

    const record = payload.record ?? payload
    const { client_name, request_type } = record
    console.log('Extracted:', { client_name, request_type })

    // Fetch all push subscriptions (per D-11: all staff get notified)
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')

    console.log('Subscriptions found:', subscriptions?.length, 'Error:', error?.message)

    if (error || !subscriptions) {
      return new Response(JSON.stringify({ error: error?.message }), { status: 500 })
    }

    if (subscriptions.length === 0) {
      console.log('No subscriptions — skipping')
      return new Response(JSON.stringify({ sent: 0, expired: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Notification payload per D-09: Title "New Task", Body "{client_name} -- {request_type}"
    const notification = JSON.stringify({
      title: 'New Task',
      body: `${client_name} \u2014 ${request_type}`,
    })

    // Fan out to all subscribers (3-5 people, no batching needed)
    console.log('Sending to', subscriptions.length, 'subscribers, payload:', notification)
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          notification,
        ),
      ),
    )

    console.log(
      'Send results:',
      results.map((r) => (r.status === 'fulfilled' ? 'OK' : `FAIL: ${r.reason}`)),
    )

    // Clean up expired subscriptions (410 Gone)
    const expired = results
      .map((r, i) =>
        r.status === 'rejected' && r.reason?.statusCode === 410 ? subscriptions[i] : null,
      )
      .filter(Boolean)

    if (expired.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in(
          'endpoint',
          expired.map((e) => e!.endpoint),
        )
    }

    return new Response(JSON.stringify({ sent: subscriptions.length, expired: expired.length }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
