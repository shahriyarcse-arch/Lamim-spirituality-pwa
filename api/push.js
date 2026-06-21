const { Redis } = require('@upstash/redis');
const webpush = require('web-push');

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

const PRAYER_NAMES = {
  fajr: '\u{1F305} Fajr',
  dhuhr: '\u{2600}\uFE0F Dhuhr',
  asr: '\u{1F324}\uFE0F Asr',
  maghrib: '\u{1F305} Maghrib',
  isha: '\u{1F319} Isha'
};

const PRAYER_NAMES_BN = {
  fajr: '\u{1F305} \u09AB\u099C\u09B0',
  dhuhr: '\u{2600}\uFE0F \u09AF\u09CB\u09B9\u09B0',
  asr: '\u{1F324}\uFE0F \u0986\u09B8\u09B0',
  maghrib: '\u{1F305} \u09AE\u09BE\u0997\u09B0\u09BF\u09AC',
  isha: '\u{1F319} \u098F\u09B6\u09BE'
};

async function getVapidKeys() {
  const cached = await redis.get('vapid_keys').catch(() => null);
  if (cached) return cached;
  const keys = webpush.generateVAPIDKeys();
  await redis.set('vapid_keys', keys).catch(() => {});
  return keys;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // GET: return VAPID public key, or run cron check
    if (req.method === 'GET') {
      if (req.query.cron === '1') {
        if (req.query.secret !== process.env.PUSH_CRON_SECRET) {
          return res.status(403).json({ error: 'Forbidden' });
        }
        const keys = await getVapidKeys();
        webpush.setVapidDetails('mailto:push@lamim.app', keys.publicKey, keys.privateKey);
        const subs = await redis.hgetall('subscriptions').catch(() => ({}));
        const notified = await redis.hgetall('notified').catch(() => ({}));
        const now = Date.now();
        let sent = 0;
        if (subs) {
          for (const [endpoint, raw] of Object.entries(subs)) {
            try {
              const { subscription, times, lang } = JSON.parse(raw);
              const isBn = lang === 'bn';
              const lastNotified = parseInt(notified[endpoint] || '0', 10);
              for (const p of times) {
                if (p.timestamp <= lastNotified) continue;
                const diff = now - p.timestamp;
                if (diff >= 0 && diff < 600000) {
                  const names = isBn ? PRAYER_NAMES_BN : PRAYER_NAMES;
                  const title = (isBn
                    ? (names[p.name] || p.name) + ' \u098F\u09B0 \u09B8\u09AE\u09AF\u09BC \u09B9\u09AF\u09BC\u09C7\u099B\u09C7!'
                    : (names[p.name] || p.name) + ' Time!');
                  const body = isBn
                    ? '\u098F\u0996\u09A8\u0987 \u09B8\u09BE\u09B2\u09BE\u09A4 \u0986\u09A6\u09BE\u09AF\u09BC \u0995\u09B0\u09C1\u09A8\u0964 \u0986\u09B2\u09CD\u09B2\u09BE\u09B9 \u0986\u09AA\u09A8\u09BE\u0995\u09C7 \u0995\u09AC\u09C1\u09B2 \u0995\u09B0\u09C1\u09A8\u0964'
                    : 'Pray now. May Allah accept your prayer.';
                  await webpush.sendNotification(subscription, JSON.stringify({
                    title, body,
                    icon: './assets/icon-192x192.png',
                    tag: 'prayer-' + p.name
                  }));
                  sent++;
                  redis.hset('notified', { [endpoint]: String(p.timestamp) }).catch(() => {});
                  break;
                }
              }
            } catch (err) {
              if (err.statusCode === 410 || err.statusCode === 404) {
                redis.hdel('subscriptions', endpoint).catch(() => {});
                redis.hdel('notified', endpoint).catch(() => {});
              }
            }
          }
        }
        return res.json({ sent });
      }
      // Return VAPID public key for client subscription
      const keys = await getVapidKeys();
      return res.json({ vapidKey: keys.publicKey });
    }

    // POST: subscribe or unsubscribe
    if (req.method === 'POST') {
      const { action, subscription, times, lang } = req.body || {};
      if (action === 'subscribe' && subscription) {
        const key = subscription.endpoint;
        await redis.hset('subscriptions', {
          [key]: JSON.stringify({ subscription, times: times || [], lang: lang || 'en' })
        });
        return res.json({ ok: true });
      }
      if (action === 'unsubscribe' && subscription) {
        await redis.hdel('subscriptions', subscription.endpoint);
        await redis.hdel('notified', subscription.endpoint);
        return res.json({ ok: true });
      }
      return res.status(400).json({ error: 'Invalid request' });
    }

    res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[Push] Error:', err);
    res.status(500).json({ error: 'Internal error' });
  }
};
