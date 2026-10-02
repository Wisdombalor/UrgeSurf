import { COUNTRY_NAMES, CR, FORMSUBMIT_TOKEN, SUPPORT_EMAIL } from './constants'

export function normalizeCountry(code) {
  return code === 'UK' ? 'GB' : code
}

export function countryName(code) {
  return COUNTRY_NAMES[normalizeCountry(code)] || 'your country'
}

// [name, lines, note] — falls back to safe generic guidance where we have
// no verified numbers yet, instead of showing another country's helplines.
export function crisisEntry(code) {
  const c = normalizeCountry(code)
  if (CR[c]) return CR[c]
  const name = countryName(c)
  return [
    name,
    [],
    `We don't have verified helpline numbers for ${name} yet. If you are in danger right now, call your local emergency number first.`,
  ]
}

export function today() {
  const d = new Date()
  return (
    d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  )
}

export function dsince(x) {
  if (!x) return 0
  return Math.max(0, Math.floor((new Date() - new Date(x + 'T00:00:00')) / 864e5))
}

export function soberStartMs(data) {
  if (data?.sinceTs) return data.sinceTs
  if (data?.since) return new Date(data.since + 'T00:00:00').getTime()
  return null
}

export function soberElapsed(data, nowMs = Date.now()) {
  const start = soberStartMs(data)
  if (!start) return { days: 0, hours: 0, mins: 0, secs: 0, totalMs: 0 }
  const totalMs = Math.max(0, nowMs - start)
  const days = Math.floor(totalMs / 864e5)
  const hours = Math.floor((totalMs % 864e5) / 36e5)
  const mins = Math.floor((totalMs % 36e5) / 6e4)
  const secs = Math.floor((totalMs % 6e4) / 1e3)
  return { days, hours, mins, secs, totalMs }
}

export function formatUrgeTime(t) {
  return new Date(t).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export function isValidPhone(phone) {
  const v = (phone || '').trim()
  if (!v) return false
  if (!/^[+\d][\d\s\-().]*$/.test(v)) return false
  const digits = v.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || '').trim())
}

export function validateSupport({ text, how, contact }) {
  const errors = {}
  if (!text.trim() || text.trim().length < 10) {
    errors.text = 'Please describe what is going on in at least 10 characters so the team can help.'
  }
  if (how === 'email') {
    if (!isValidEmail(contact)) errors.contact = 'Enter a valid email address, e.g. name@example.com.'
  } else if (!isValidPhone(contact)) {
    errors.contact = 'Enter a valid phone number with at least 7 digits.'
  }
  return errors
}

export function fmt(x) {
  return new Date(x + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export function moneySaved(data) {
  const weekly = Number(data?.weeklySpend) || 0
  if (!weekly || weekly <= 0) return 0
  return (weekly / 7) * dsince(data?.since)
}

export function formatMoney(amount, currencyCode) {
  const code = currencyCode || 'NGN'
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: code,
      maximumFractionDigits: amount >= 1000 ? 0 : 2,
    }).format(amount)
  } catch {
    return `${code} ${Math.round(amount).toLocaleString()}`
  }
}

export function longest(data) {
  let m = dsince(data.since)
  data.periods.forEach((p) => {
    if (p.days > m) m = p.days
  })
  return m
}

export function greet() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function mailtoLink(r) {
  const b = 'Name: ' + (r.name || '-') + '\nUrgent: ' + (r.urgent ? 'YES' : 'no') + '\nReply by ' + r.how + ': ' + r.contact + '\n\n' + r.text
  return (
    'mailto:' +
    SUPPORT_EMAIL +
    '?subject=' +
    encodeURIComponent('UrgeSurf support request' + (r.urgent ? ' (URGENT)' : '')) +
    '&body=' +
    encodeURIComponent(b)
  )
}

export function containsContactInfo(text) {
  const v = text || ''
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(v)) return true
  const digits = v.replace(/\D/g, '')
  if (digits.length >= 9 && /(\+?\d[\d\s\-().]{7,}\d)/.test(v)) return true
  return false
}

export function readFilesAsDataUrls(files, { maxEach = 3 * 1024 * 1024, maxCount = 4 } = {}) {
  const list = [...(files || [])].slice(0, maxCount)
  return Promise.all(
    list.map(
      (f) =>
        new Promise((resolve, reject) => {
          if (f.size > maxEach) {
            reject(new Error(`“${f.name}” is over ${Math.round(maxEach / 1024 / 1024)}MB. Pick a smaller file.`))
            return
          }
          const rd = new FileReader()
          rd.onload = () => resolve({ name: f.name, type: f.type, url: rd.result })
          rd.onerror = () => reject(new Error(`Could not read “${f.name}”.`))
          rd.readAsDataURL(f)
        }),
    ),
  )
}

function postToInbox(payload) {
  return fetch('https://formsubmit.co/ajax/' + FORMSUBMIT_TOKEN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })
    .then(async (x) => {
      let j = null
      try {
        j = await x.json()
      } catch {
        j = null
      }
      if (!x.ok || !j || j.success === false || j.success === 'false') {
        throw new Error((j && j.message) || `Send failed (HTTP ${x.status}).`)
      }
      return j
    })
    .catch((e) => {
      // Surface the reason so the UI can offer the mailto fallback.
      throw e instanceof Error ? e : new Error('Send failed. Check your connection and try again.')
    })
}

export function sendSupportRequest(r) {
  const b = {
    _subject: 'UrgeSurf support request' + (r.urgent ? ' (URGENT)' : ''),
    _captcha: 'false',
    _template: 'table',
    name: r.name || '(none)',
    message: r.text,
    reply_by: r.how,
    contact: r.contact,
    urgent: r.urgent ? 'YES' : 'no',
  }
  if (r.how === 'email') {
    b.email = r.contact
    b._replyto = r.contact
    b._autoresponse =
      `Hi${r.name ? ' ' + r.name : ''},\n\nWe received your UrgeSurf support request and the team will reply by email as soon as they can. ` +
      `Your message: “${r.text.slice(0, 500)}${r.text.length > 500 ? '…' : ''}”\n\nIf you need someone right now, please use the crisis numbers in the app instead of waiting.\n\n— The UrgeSurf team`
  }
  return postToInbox(b)
}

export function sendReportEmail({ post, reason, details, reporter }) {
  return postToInbox({
    _subject: 'UrgeSurf community report: ' + reason,
    _captcha: 'false',
    _template: 'table',
    type: 'community-report',
    reason,
    details: details || '(no extra details)',
    reported_post: (post?.text || '').slice(0, 1000),
    reported_by_shown_as: post?.who || 'Anonymous member',
    reported_post_id: post?.id || post?.t || '(unknown)',
    reporter: reporter || '(anonymous app user)',
  })
}

export function sendFeedbackEmail({ name, email, message }) {
  return postToInbox({
    _subject: 'UrgeSurf app feedback from ' + (name || 'a user'),
    _captcha: 'false',
    _template: 'table',
    type: 'app-feedback',
    name: name || '(none)',
    email,
    _replyto: email,
    message,
    _autoresponse:
      `Hi${name ? ' ' + name : ''},\n\nThanks — your suggestion for improving UrgeSurf was received. ` +
      `We read every note and use them to plan the next update.\n\n— The UrgeSurf team`,
  })
}
