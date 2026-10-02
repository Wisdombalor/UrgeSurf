import { useCallback, useEffect, useRef, useState } from 'react'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import Home from './pages/Home'
import Recovery from './pages/Recovery'
import Community from './pages/Community'
import Support from './pages/Support'
import UrgeStrengthSheet from './sheets/UrgeStrengthSheet'
import UrgeHelpSheet from './sheets/UrgeHelpSheet'
import BreatheSheet from './sheets/BreatheSheet'
import DistractSheet from './sheets/DistractSheet'
import CheckinSheet from './sheets/CheckinSheet'
import RelapseSheet from './sheets/RelapseSheet'
import AfterRelapseSheet from './sheets/AfterRelapseSheet'
import CrisisSheet from './sheets/CrisisSheet'
import TalkSheet from './sheets/TalkSheet'
import SupportRequestSheet from './sheets/SupportRequestSheet'
import SupportWaitingSheet from './sheets/SupportWaitingSheet'
import TrustedPeopleSheet from './sheets/TrustedPeopleSheet'
import BlockerListSheet from './sheets/BlockerListSheet'
import BlockerGuideSheet from './sheets/BlockerGuideSheet'
import ShareStorySheet from './sheets/ShareStorySheet'
import ShareDoneSheet from './sheets/ShareDoneSheet'
import OnboardingSheet from './sheets/OnboardingSheet'
import WelcomeSheet from './sheets/WelcomeSheet'
import ReportSheet from './sheets/ReportSheet'
import ContactAdminSheet from './sheets/ContactAdminSheet'
import ProfileSheet from './sheets/ProfileSheet'
import AuthSheet from './sheets/AuthSheet'
import { clearData, loadData, persistLocal } from './lib/storage'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { dsince, sendFeedbackEmail, sendReportEmail, sendSupportRequest, today } from './lib/helpers'

const GUEST_KEY = 'rc_guest'

function readGuestFlag() {
  try {
    return localStorage.getItem(GUEST_KEY) === '1'
  } catch {
    return false
  }
}

export default function App() {
  const [data, setData] = useState(() => loadData())
  const [tab, setTab] = useState('home')
  const [sheet, setSheet] = useState(null)
  const [toastMsg, setToastMsg] = useState('')
  const [urgeLevel, setUrgeLevel] = useState(7)
  const [urgeTriggers, setUrgeTriggers] = useState([])
  const [posts, setPosts] = useState([])
  const [user, setUser] = useState(null)
  const [isGuest, setIsGuest] = useState(() => readGuestFlag())

  const dataRef = useRef(data)
  const dbRef = useRef(null)
  const uidRef = useRef(null)
  const authReturn = useRef(null)
  const toastTimer = useRef(null)
  const sheetRef = useRef(sheet)
  dataRef.current = data
  sheetRef.current = sheet

  const showToast = useCallback((t) => {
    setToastMsg(t)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToastMsg(''), 2200)
  }, [])

  const updateData = useCallback((patch) => {
    setData((prev) => {
      const next = typeof patch === 'function' ? patch(prev) : { ...prev, ...patch }
      persistLocal(next)
      if (dbRef.current && uidRef.current) {
        dbRef.current
          .doc('data/users/' + uidRef.current + '/app')
          .set(next)
          .catch(() => {})
      }
      dataRef.current = next
      return next
    })
  }, [])

  const closeSheet = useCallback(() => setSheet(null), [])

  const setGuest = useCallback((v) => {
    setIsGuest(v)
    try {
      if (v) localStorage.setItem(GUEST_KEY, '1')
      else localStorage.removeItem(GUEST_KEY)
    } catch {
      // ignore
    }
  }, [])

  // First launch: restore Supabase session, then route to auth → onboarding.
  // Returning onboarded users (guest or signed-in) go straight in.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      let sessionUser = null
      try {
        if (supabase) {
          const { data } = await supabase.auth.getSession()
          sessionUser = data?.session?.user || null
        }
      } catch {
        sessionUser = null
      }
      if (cancelled) return
      setUser(sessionUser)
      if (sessionUser) setGuest(false)
      if (!dataRef.current.onboarded && !sessionUser && !readGuestFlag()) {
        setSheet({ name: 'auth' })
      } else if (!dataRef.current.onboarded) {
        setSheet({ name: 'onboard' })
      }
    })()
    const sub = supabase?.auth.onAuthStateChange((event, session) => {
      const u = session?.user || null
      setUser(u)
      if (u) setGuest(false)
      // User opened the email reset link — show the new-password screen.
      if (event === 'PASSWORD_RECOVERY') {
        setSheet({ name: 'auth', reset: true })
      }
    })
    return () => {
      cancelled = true
      try {
        sub?.data?.subscription?.unsubscribe()
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Community feed from Supabase when configured (graceful local fallback).
  useEffect(() => {
    if (!supabase || !isSupabaseConfigured) return
    let cancelled = false
    ;(async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id,created_at,text,who,sober_days,owner_id')
          .order('created_at', { ascending: false })
          .limit(100)
        if (error || cancelled) return
        setPosts(
          (data || []).map((r) => ({
            id: r.id,
            t: new Date(r.created_at).getTime(),
            text: r.text,
            who: r.who || '',
            cat: 'Story',
            media: [],
            soberDays: r.sober_days ?? null,
            owner: r.owner_id || '',
          })),
        )
      } catch {
        // table may not exist yet — local posts still work
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  // Optional claude.ai backend — gracefully degrades to localStorage outside it.
  useEffect(() => {
    ;(async () => {
      try {
        if (!window.claude) return
        const u = await window.claude.use('user')
        const uid = u && u.id ? await u.id() : null
        const db = await window.claude.use('db')
        if (!db || !uid) return
        uidRef.current = uid
        dbRef.current = db
        const g = await db.doc('data/users/' + uid + '/app').get()
        if (g.exists) {
          const merged = { ...dataRef.current, ...g.data() }
          dataRef.current = merged
          setData(merged)
          persistLocal(merged)
          if (merged.onboarded && sheetRef.current?.name === 'onboard') setSheet(null)
        }
        db.collection('posts').onSnapshot(
          (q) => {
            setPosts(q.docs.map((d) => d.data()).sort((a, b) => b.t - a.t))
          },
          () => {},
        )
      } catch {
        dbRef.current = null
      }
    })()
  }, [])

  function openGuide(index) {
    setSheet({ name: 'guide', index })
  }

  function handleUrgeNext(lvl, trig) {
    setUrgeLevel(+lvl)
    setUrgeTriggers(trig.slice())
    setSheet({ name: 'help' })
  }

  function handleHelpPick(key) {
    if (key === 'breathe') setSheet({ name: 'breathe' })
    else if (key === 'dist') setSheet({ name: 'dist' })
    else setSheet({ name: 'checkin' })
  }

  function handleCallTrusted(contact) {
    if (contact) {
      // The <a href="tel:…"> already opens the device dialer; keep the
      // sheet open behind it and confirm afterwards.
      showToast('Calling ' + contact.n + '…')
      return
    }
    // No trusted person saved yet — route them to add one.
    setSheet({ name: 'trusted', add: true })
    showToast('Add a trusted person first')
  }

  function handleSaveUrgeOnly() {
    updateData((prev) => ({ ...prev, urges: [...prev.urges, { t: Date.now(), lvl: +urgeLevel, trig: urgeTriggers.slice() }] }))
    closeSheet()
    showToast('Urge saved privately')
  }

  function handleCheckinSave(now) {
    updateData((prev) => ({
      ...prev,
      urges: [...prev.urges, { t: Date.now(), lvl: +urgeLevel, now: +now, trig: urgeTriggers.slice(), alt: 1 }],
    }))
    closeSheet()
    showToast('Saved. You chose an alternative.')
  }

  function handleSaveCheckin(labels) {
    const day = today()
    updateData((prev) => ({
      ...prev,
      checkins: { ...(prev.checkins || {}), [day]: labels.slice() },
    }))
    if (labels.length > 0) showToast('Check-in saved. One protected step at a time.')
  }

  function handleRestartPeriod() {
    const current = dataRef.current
    const c = dsince(current.since)
    updateData((prev) => {
      const periods = current.since ? [...prev.periods, { from: prev.since, to: today(), days: c }] : prev.periods
      return { ...prev, periods, since: today(), sinceTs: Date.now() }
    })
    setSheet({ name: 'after' })
  }

  async function handleSupportSubmit(r) {
    const req = { t: Date.now(), ...r, status: 'sending' }
    updateData((prev) => ({ ...prev, req }))
    try {
      await sendSupportRequest(req)
      const sent = { ...req, status: 'sent' }
      updateData((prev) => ({ ...prev, req: sent }))
      showToast(
        r.how === 'email' ? 'Request sent. A receipt was emailed to you.' : 'Request sent to the support team.',
      )
    } catch (e) {
      const manual = { ...req, status: 'manual', sendError: e?.message || 'Send failed.' }
      updateData((prev) => ({ ...prev, req: manual }))
    }
    setSheet({ name: 'waiting' })
  }

  async function handleReportSubmit(post, reason, details) {
    await sendReportEmail({ post, reason, details, reporter: dataRef.current.name || '(anonymous app user)' })
    showToast('Reported. The admin was notified by email.')
  }

  async function handleFeedbackSubmit({ name, email, message }) {
    await sendFeedbackEmail({ name, email, message })
    showToast('Thanks! Your note was sent to the admin.')
  }

  function handleGuest() {
    authReturn.current = null
    setGuest(true)
    // Already-onboarded guests who hit the login wall (e.g. via Share) must
    // land back where they were — never back on the onboarding screen.
    if (!dataRef.current.onboarded) setSheet({ name: 'onboard' })
    else closeSheet()
  }

  function handleAuthed() {
    setGuest(false)
    if (!dataRef.current.onboarded) {
      setSheet({ name: 'onboard' })
    } else if (authReturn.current === 'share') {
      authReturn.current = null
      setSheet({ name: 'share' })
      showToast('Signed in — you can post now')
    } else {
      closeSheet()
      showToast('Signed in')
    }
  }

  function handleShareClick() {
    if (!user) {
      // Guests must log in before they can share — take them there instantly,
      // then drop them back on the share sheet once signed in.
      authReturn.current = 'share'
      setSheet({ name: 'auth' })
      return
    }
    setSheet({ name: 'share' })
  }

  async function handleSignOut() {
    try {
      await supabase?.auth.signOut()
    } catch {
      // ignore
    }
    setUser(null)
    setGuest(true)
    closeSheet()
    showToast("Signed out. You're browsing as a guest.")
  }

  // Guests: wipe this device and restart onboarding (stay a guest).
  function handleDeleteAll() {
    const fresh = clearData()
    if (dbRef.current && uidRef.current) {
      dbRef.current
        .doc('data/users/' + uidRef.current + '/app')
        .set(fresh)
        .catch(() => {})
    }
    dataRef.current = fresh
    setData(fresh)
    setTab('home')
    setSheet({ name: 'onboard' })
    showToast('Your data was deleted. Starting fresh.')
  }

  // Signed-in users: delete community posts + local data, sign out, back to auth.
  // Note: removing the auth user itself needs the secret key on a server —
  // this clears everything the app controls and ends the session.
  async function handleDeleteAccount() {
    const u = user
    try {
      if (supabase && u) {
        await supabase.from('posts').delete().eq('owner_id', u.id)
      }
    } catch {
      // ignore — local wipe still proceeds
    }
    try {
      await supabase?.auth.signOut()
    } catch {
      // ignore
    }
    setUser(null)
    setGuest(false)
    try {
      localStorage.removeItem(GUEST_KEY)
    } catch {
      // ignore
    }
    const fresh = clearData()
    dataRef.current = fresh
    setData(fresh)
    setPosts([])
    setTab('home')
    setSheet({ name: 'auth' })
    showToast('Account data deleted. You are signed out.')
  }

  function handleDeleteShared(id) {
    updateData((prev) => ({ ...prev, mine: prev.mine.filter((x) => (x.id || x.t) !== id) }))
    showToast('Story deleted')
  }

  function handleDeletePrivate(t) {
    updateData((prev) => ({ ...prev, stories: prev.stories.filter((x) => x.t !== t) }))
    showToast('Journal entry deleted')
  }

  function handleToggleGuideStep(blockerName, k, total) {
    updateData((prev) => {
      const st = [...(prev.gs[blockerName] || [])]
      st[k] = !st[k]
      const done = st.filter(Boolean).length === total
      return { ...prev, gs: { ...prev.gs, [blockerName]: st }, active: { ...prev.active, [blockerName]: done } }
    })
  }

  function handleSharePost({ visibility, text, who, media }) {
    if (visibility === 'priv') {
      updateData((prev) => ({ ...prev, stories: [...prev.stories, { t: Date.now(), text, media: media || [] }] }))
      setTab('com')
      setSheet({ name: 'share-done', visibility: 'priv', who: '' })
      return
    }
    const id = Date.now() + '-' + Math.random().toString(36).slice(2, 7)
    const ownerId = user?.id || uidRef.current || 'local'
    const p = { id, t: Date.now(), text, who: who || '', owner: ownerId, cat: 'Story', media: media || [], soberDays: dsince(dataRef.current.since) }
    updateData((prev) => ({ ...prev, mine: [p, ...prev.mine].slice(0, 50) }))
    if (dbRef.current) {
      dbRef.current
        .doc('posts/' + id)
        .set(p)
        .catch(() => showToast('Shared from this device only'))
    }
    if (supabase && user) {
      supabase
        .from('posts')
        .insert({ owner_id: user.id, text, who: who || '', sober_days: dsince(dataRef.current.since) })
        .select('id,created_at,text,who,sober_days,owner_id')
        .then(({ data: rows, error }) => {
          if (error || !rows?.length) return
          const r = rows[0]
          const remote = {
            id: r.id,
            t: new Date(r.created_at).getTime(),
            text: r.text,
            who: r.who || '',
            cat: 'Story',
            media: [],
            soberDays: r.sober_days ?? null,
            owner: r.owner_id || '',
          }
          setPosts((prev) => [remote, ...prev])
          updateData((prev) => ({ ...prev, mine: [remote, ...prev.mine.filter((x) => (x.id || x.t) !== id)].slice(0, 50) }))
        })
        .catch(() => {})
    }
    setTab('com')
    setSheet({ name: 'share-done', visibility: 'com', who: who || '' })
  }

  function renderSheet() {
    if (!sheet) return null
    switch (sheet.name) {
      case 'urge':
        return <UrgeStrengthSheet level={urgeLevel} onClose={closeSheet} onNext={handleUrgeNext} />
      case 'help':
        return (
          <UrgeHelpSheet
            contacts={data.contacts}
            onPick={handleHelpPick}
            onSaveOnly={handleSaveUrgeOnly}
            onCall={handleCallTrusted}
          />
        )
      case 'breathe':
        return <BreatheSheet onCalmer={() => setSheet({ name: 'checkin' })} />
      case 'dist':
        return <DistractSheet interests={data.interests} onStart={() => setSheet({ name: 'checkin' })} />
      case 'checkin':
        return (
          <CheckinSheet startLevel={urgeLevel} onSave={handleCheckinSave} onRelapse={() => setSheet({ name: 'relapse' })} />
        )
      case 'relapse':
        return <RelapseSheet data={data} onRestart={handleRestartPeriod} onNotNow={closeSheet} />
      case 'after':
        return (
          <AfterRelapseSheet
            onOpenBlockers={() => setSheet({ name: 'blk' })}
            onOpenTrusted={() => setSheet({ name: 'trusted', add: false })}
            onOpenCrisis={() => setSheet({ name: 'crisis' })}
            onGoRecovery={() => {
              setTab('rec')
              closeSheet()
            }}
          />
        )
      case 'crisis':
        return (
          <CrisisSheet
            country={data.country}
            onCountry={(country) => updateData({ country })}
            onClose={closeSheet}
          />
        )
      case 'talk':
        return (
          <TalkSheet
            data={data}
            onClose={closeSheet}
            onOpenRequest={() => setSheet({ name: 'request' })}
            onOpenWaiting={() => setSheet({ name: 'waiting' })}
          />
        )
      case 'request':
        return <SupportRequestSheet data={data} onClose={closeSheet} onSubmit={handleSupportSubmit} />
      case 'waiting':
        return (
          <SupportWaitingSheet
            req={data.req}
            country={data.country}
            onClose={closeSheet}
            onClear={() => {
              updateData({ req: null })
              closeSheet()
              showToast('Request cleared')
            }}
            onOpenCrisis={() => setSheet({ name: 'crisis' })}
          />
        )
      case 'trusted':
        return (
          <TrustedPeopleSheet
            contacts={data.contacts}
            addMode={!!sheet.add}
            onAddMode={() => setSheet({ name: 'trusted', add: true })}
            onListMode={() => setSheet({ name: 'trusted', add: false })}
            onSave={(c) => {
              updateData((prev) => ({ ...prev, contacts: [...prev.contacts, c] }))
              setSheet({ name: 'trusted', add: false })
              showToast('Trusted person saved')
            }}
            onRemove={(i) => {
              updateData((prev) => ({ ...prev, contacts: prev.contacts.filter((_, k) => k !== +i) }))
            }}
            onClose={closeSheet}
          />
        )
      case 'blk':
        return (
          <BlockerListSheet progress={data.gs} active={data.active} onClose={closeSheet} onGuide={openGuide} />
        )
      case 'guide':
        return (
          <BlockerGuideSheet
            index={sheet.index}
            progress={data.gs}
            onBack={() => setSheet({ name: 'blk' })}
            onToggle={handleToggleGuideStep}
          />
        )
      case 'auth':
        return (
          <AuthSheet
            initialStep={sheet.reset ? 'reset' : 'form'}
            // First-launch users must pick login or guest — no skipping.
            // Everyone else (e.g. via Share) gets an X to back out.
            closable={data.onboarded}
            onAuthed={handleAuthed}
            onGuest={handleGuest}
            onClose={closeSheet}
          />
        )
      case 'share':
        return (
          <ShareStorySheet
            defaultName={data.name}
            isGuest={!user}
            onLogin={() => setSheet({ name: 'auth' })}
            onClose={closeSheet}
            onPost={handleSharePost}
          />
        )
      case 'share-done': {
        const label = sheet.visibility === 'priv' ? 'Saved to your private journal.' : sheet.who ? `Posted as ${sheet.who}.` : 'Posted anonymously.'
        return (
          <ShareDoneSheet
            title={sheet.visibility === 'priv' ? 'Saved privately' : 'Your story is live'}
            message={`${label} You can find it under Community → ${sheet.visibility === 'priv' ? 'Private' : 'Mine'}.`}
            onView={() => {
              setTab('com')
              closeSheet()
            }}
          />
        )
      }
      case 'report':
        return (
          <ReportSheet
            post={sheet.post}
            onClose={closeSheet}
            onSubmit={async (reason, details) => {
              await handleReportSubmit(sheet.post, reason, details)
              closeSheet()
            }}
          />
        )
      case 'feedback':
        return <ContactAdminSheet onClose={closeSheet} onSubmit={handleFeedbackSubmit} />
      case 'welcome':
        return (
          <WelcomeSheet
            name={data.name}
            onViewRecovery={() => {
              setTab('rec')
              closeSheet()
            }}
            onLogUrge={() => setSheet({ name: 'urge' })}
            onClose={closeSheet}
          />
        )
      case 'onboard':
        return (
          <OnboardingSheet
            onComplete={(v) => {
              updateData((prev) => ({ ...prev, ...v, onboarded: true }))
              setSheet({ name: 'welcome' })
            }}
          />
        )
      case 'profile':
        return (
          <ProfileSheet
            data={data}
            user={user}
            isGuest={!user}
            onClose={closeSheet}
            onSave={(v) => {
              updateData(v)
              closeSheet()
              showToast('Profile saved')
            }}
            onDelete={handleDeleteAll}
            onDeleteAccount={handleDeleteAccount}
            onSignOut={handleSignOut}
            onLogin={() => setSheet({ name: 'auth' })}
          />
        )
      default:
        return null
    }
  }

  return (
    <div id="app">
      <main>
        {tab === 'home' ? (
          <Home
            data={data}
            user={user}
            isGuest={!user}
            onLogin={() => setSheet({ name: 'auth' })}
            onSignOut={handleSignOut}
            onOpenUrge={() => setSheet({ name: 'urge' })}
            onOpenProfile={() => setSheet({ name: 'profile' })}
            onOpenBlockers={() => setSheet({ name: 'blk' })}
            onResetStreak={() => setSheet({ name: 'relapse' })}
            onSaveCheckin={handleSaveCheckin}
            onGoRecovery={() => setTab('rec')}
          />
        ) : null}
        {tab === 'rec' ? (
          <Recovery
            data={data}
            onLogUrge={() => setSheet({ name: 'urge' })}
            onResetStreak={() => setSheet({ name: 'relapse' })}
            onEditStreakDate={() => setSheet({ name: 'profile' })}
          />
        ) : null}
        {tab === 'com' ? (
          <Community
            data={data}
            posts={posts}
            isGuest={!user}
            onLogin={() => setSheet({ name: 'auth' })}
            onShare={handleShareClick}
            onToast={showToast}
            onDeleteShared={handleDeleteShared}
            onDeletePrivate={handleDeletePrivate}
            onReport={(post) => setSheet({ name: 'report', post })}
          />
        ) : null}
        {tab === 'sup' ? (
          <Support
            data={data}
            onOpenBlockers={() => setSheet({ name: 'blk' })}
            onOpenTalk={() => setSheet({ name: 'talk' })}
            onOpenTrusted={() => setSheet({ name: 'trusted', add: false })}
            onOpenCrisis={() => setSheet({ name: 'crisis' })}
            onContactAdmin={() => setSheet({ name: 'feedback' })}
          />
        ) : null}
      </main>
      <BottomNav tab={tab} onChange={setTab} />
      {renderSheet()}
      <Toast message={toastMsg} />
    </div>
  )
}
