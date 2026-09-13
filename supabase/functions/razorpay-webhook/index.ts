import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders, json } from '../_shared/cors.ts';

async function verifySignature(payload: Uint8Array, signature: string, secret: string): Promise<boolean> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  );
  const encoded = Uint8Array.from(signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
  const payloadBuffer = payload.buffer.slice(payload.byteOffset, payload.byteOffset + payload.byteLength) as ArrayBuffer;
  return crypto.subtle.verify('HMAC', key, encoded, payloadBuffer);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const webhookSecret = Deno.env.get('RAZORPAY_WEBHOOK_SECRET');
  const signature = request.headers.get('X-Razorpay-Signature');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!webhookSecret || !signature || !supabaseUrl || !serviceRoleKey) {
    return json({ error: 'Webhook configuration is incomplete' }, 500);
  }

  const payload = new Uint8Array(await request.arrayBuffer());
  if (!(await verifySignature(payload, signature, webhookSecret))) return json({ error: 'Invalid webhook signature' }, 400);

  const body = JSON.parse(new TextDecoder().decode(payload));
  const event = typeof body?.event === 'string' ? body.event : '';
  const payment = body?.payload?.payment?.entity;
  const paymentId = typeof payment?.id === 'string' ? payment.id : '';
  const razorpayOrderId = typeof payment?.order_id === 'string' ? payment.order_id : '';
  const amountPaise = typeof payment?.amount === 'number' ? payment.amount : 0;
  if (!paymentId || !razorpayOrderId || !['payment.captured', 'payment.failed'].includes(event)) {
    return json({ received: true });
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const { data: order, error: orderError } = await adminClient
    .from('orders')
    .select('id, customer_id, status')
    .eq('razorpay_order_id', razorpayOrderId)
    .maybeSingle();
  if (orderError) return json({ error: orderError.message }, 500);
  if (!order) {
    const { data: purchase, error: purchaseError } = await adminClient
      .from('subscription_purchases')
      .select('id, user_id, plan_id, vendor_id, customer_paid_paise, status, user_subscription_id')
      .eq('razorpay_order_id', razorpayOrderId)
      .maybeSingle();
    if (purchaseError) return json({ error: purchaseError.message }, 500);
    if (!purchase) return json({ received: true });
    if (payment?.currency !== 'INR' || amountPaise !== purchase.customer_paid_paise) {
      return json({ error: 'Subscription payment amount or currency does not match.' }, 400);
    }
    if (purchase.status === 'confirmed' || purchase.user_subscription_id) return json({ received: true });

    if (event === 'payment.failed') {
      const { error: failedError } = await adminClient
        .from('subscription_purchases')
        .update({ status: 'payment_failed', razorpay_payment_id: paymentId })
        .eq('id', purchase.id)
        .eq('status', 'pending_payment');
      if (failedError) return json({ error: failedError.message }, 409);
      return json({ received: true });
    }

    const { data: plan, error: planError } = await adminClient
      .from('subscription_plans')
      .select('total_meals, duration_days')
      .eq('id', purchase.plan_id)
      .maybeSingle();
    if (planError) return json({ error: planError.message }, 500);
    if (!plan) return json({ error: 'Subscription plan not found.' }, 409);

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (Number(plan.duration_days) - 1) * 24 * 60 * 60 * 1000);
    const { data: subscription, error: subscriptionError } = await adminClient
      .from('user_subscriptions')
      .insert({
        user_id: purchase.user_id,
        plan_id: purchase.plan_id,
        total_meals: plan.total_meals,
        meals_remaining: plan.total_meals,
        start_date: startDate.toISOString().slice(0, 10),
        end_date: endDate.toISOString().slice(0, 10),
        status: 'active',
      })
      .select()
      .single();
    if (subscriptionError) return json({ error: subscriptionError.message }, 409);

    const { error: purchaseUpdateError } = await adminClient
      .from('subscription_purchases')
      .update({ status: 'confirmed', razorpay_payment_id: paymentId, user_subscription_id: subscription.id })
      .eq('id', purchase.id)
      .eq('status', 'pending_payment');
    if (purchaseUpdateError) return json({ error: purchaseUpdateError.message }, 409);
    return json({ received: true });
  }

  const paymentStatus = event === 'payment.captured' ? 'captured' : 'failed';
  const { error: paymentError } = await adminClient.from('payments').upsert({
    order_id: order.id,
    razorpay_payment_id: paymentId,
    amount_paise: amountPaise,
    status: paymentStatus,
    raw_webhook_payload: body,
  }, { onConflict: 'razorpay_payment_id' });
  if (paymentError) return json({ error: paymentError.message }, 500);

  const nextStatus = paymentStatus === 'captured' ? 'confirmed' : 'payment_failed';
  if (order.status === 'pending_payment') {
    const { error: orderUpdateError } = await adminClient
      .from('orders')
      .update({ status: nextStatus, razorpay_payment_id: paymentId })
      .eq('id', order.id);
    if (orderUpdateError) return json({ error: orderUpdateError.message }, 409);
  }

  await adminClient.from('customer_notifications').upsert({
    customer_id: order.customer_id,
    order_id: order.id,
    title: paymentStatus === 'captured' ? 'Payment confirmed' : 'Payment failed',
    body: paymentStatus === 'captured' ? 'Your order has been sent to the vendor.' : 'Your payment could not be confirmed. Please try again.',
    notification_type: 'payment',
  }, { onConflict: 'order_id' });

  return json({ received: true });
});
