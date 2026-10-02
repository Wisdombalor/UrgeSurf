import { useState } from 'react'
import Sheet from '../components/Sheet'
import { LogoLockup } from '../components/Logo'
import { INTERESTS_ALL } from '../lib/constants'
import { AmountInput, CountrySelect, CurrencySelect } from '../components/ui'
import { today } from '../lib/helpers'
import { ASSESS_OPTIONS, ASSESS_QUESTIONS, scoreAssessment } from '../lib/assessment'

export default function OnboardingSheet({ onComplete }) {
  const [step, setStep] = useState('info')
  const [name, setName] = useState('')
  const [date, setDate] = useState(today())
  const [country, setCountry] = useState('NG')
  const [sel, setSel] = useState([])
  const [nameError, setNameError] = useState('')
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState(Array(ASSESS_QUESTIONS.length).fill(null))
  const [result, setResult] = useState(null)
  const [weeklySpend, setWeeklySpend] = useState('')
  const [currency, setCurrency] = useState('NGN')
  const [spendError, setSpendError] = useState('')

  function toggle(t) {
    setSel((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]))
  }

  function handleInfoNext() {
    if (!name.trim()) {
      setNameError('Please enter your name or a nickname to continue.')
      return
    }
    if (!date) return
    setNameError('')
    setStep('test-offer')
  }

  function finishTest(nextAnswers) {
    const r = scoreAssessment(nextAnswers)
    setResult({ ...r, answers: nextAnswers.slice(), date: new Date().toISOString() })
    setStep('result')
  }

  function pickAnswer(v) {
    const next = answers.slice()
    next[qIndex] = v
    setAnswers(next)
    if (qIndex < ASSESS_QUESTIONS.length - 1) {
      setQIndex(qIndex + 1)
    } else {
      finishTest(next)
    }
  }

  function handleFinish() {
    const mustEnterSpend = result?.isAddict
    const spend = Number(weeklySpend)
    if (mustEnterSpend && (!weeklySpend || !(spend > 0))) {
      setSpendError('Because your check shows risky patterns, please enter what you usually spend gambling per week. This powers your money-saved tracker.')
      return
    }
    if (weeklySpend && !(spend >= 0)) {
      setSpendError('Enter a valid amount, e.g. 5000.')
      return
    }
    setSpendError('')
    onComplete({
      name: name.trim(),
      since: date || today(),
      sinceTs: Date.now(),
      country,
      interests: sel,
      assessment: result,
      weeklySpend: weeklySpend === '' ? '' : String(spend),
      currency,
    })
  }

  const progress = Math.round(((qIndex + 1) / ASSESS_QUESTIONS.length) * 100)

  return (
    <Sheet>
      {step === 'info' ? (
        <>
          <div style={{ marginBottom: 4 }}>
            <LogoLockup />
          </div>
          <h1>Welcome to UrgeSurf</h1>
          <p className="s" style={{ marginTop: 6 }}>
            This stays private to you. You can change it later.
          </p>
          <h2>What should we call you?</h2>
          <input
            className="in"
            placeholder="Your name or a nickname"
            value={name}
            aria-invalid={!!nameError}
            aria-describedby={nameError ? 'onboard-name-error' : undefined}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError && e.target.value.trim()) setNameError('')
            }}
            onBlur={() => {
              if (!name.trim()) setNameError('Please enter your name or a nickname to continue.')
            }}
          />
          {nameError ? (
            <span id="onboard-name-error" role="alert" className="field-error">
              {nameError}
            </span>
          ) : null}
          <h2>Your sober date</h2>
          <p className="s">The day of your last bet. Not sure? Use today.</p>
          <input className="in" type="date" max={today()} value={date} onChange={(e) => setDate(e.target.value)} />
          <h2>Your country</h2>
          <p className="s">Used to show the right emergency numbers.</p>
          <CountrySelect value={country} onChange={setCountry} />
          <h2>Things you enjoy (optional)</h2>
          <div>
            {INTERESTS_ALL.map((t) => (
              <button key={t} className="chip" aria-pressed={sel.includes(t)} onClick={() => toggle(t)}>
                {t}
              </button>
            ))}
          </div>
          <button className="cta" style={{ marginTop: 'auto' }} onClick={handleInfoNext}>
            Continue
          </button>
        </>
      ) : null}

      {step === 'test-offer' ? (
        <>
          <h1>Nice to meet you{name.trim() ? `, ${name.trim()}` : ''}.</h1>
          <p className="s" style={{ marginTop: 6 }}>
            Want a quick 2-minute check to see if gambling is becoming a problem for you?
          </p>
          <div className="card" style={{ marginTop: 14 }}>
            <b>Optional self-test · 9 questions</b>
            <p className="s" style={{ marginTop: 6 }}>
              Private to this device. It helps us personalise your protection plan — including your weekly
              spending tracker.
            </p>
          </div>
          <button className="cta" onClick={() => { setQIndex(0); setStep('test') }}>
            Take the test
          </button>
          <button className="ghost" onClick={() => { setResult(null); setStep('spend') }}>
            Skip for now
          </button>
        </>
      ) : null}

      {step === 'test' ? (
        <>
          <p className="s">
            Question {qIndex + 1} of {ASSESS_QUESTIONS.length}
          </p>
          <div className="bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <i style={{ width: progress + '%' }} />
          </div>
          <h1 style={{ marginTop: 14 }}>{ASSESS_QUESTIONS[qIndex]}</h1>
          <p className="s" style={{ marginTop: 6 }}>
            In the last 12 months, how often…
          </p>
          <div style={{ marginTop: 14 }}>
            {ASSESS_OPTIONS.map((o) => (
              <button
                key={o.value}
                className="card opt"
                style={{ borderColor: answers[qIndex] === o.value ? 'var(--acc)' : 'var(--line)' }}
                onClick={() => pickAnswer(o.value)}
              >
                <b>{o.label}</b>
              </button>
            ))}
          </div>
          <div className="row" style={{ marginTop: 8 }}>
            <button
              className="ghost"
              disabled={qIndex === 0}
              style={{ opacity: qIndex === 0 ? 0.4 : 1 }}
              onClick={() => setQIndex(Math.max(0, qIndex - 1))}
            >
              Back
            </button>
            <button className="ghost" onClick={() => { setResult(null); setStep('spend') }}>
              Skip test
            </button>
          </div>
        </>
      ) : null}

      {step === 'result' && result ? (
        <>
          <h1>{result.title}</h1>
          <p className="s" style={{ marginTop: 6 }}>
            Score {result.score} of 27 · for self-reflection only, not a diagnosis.
          </p>
          <div
            className="card"
            style={{ marginTop: 14, borderColor: result.isAddict ? 'var(--urge)' : 'var(--acc)' }}
          >
            <p>{result.blurb}</p>
            {result.isAddict ? (
              <p className="s" style={{ marginTop: 8 }}>
                Next, you will set your usual weekly gambling spend — this is required so the app can show
                you exactly how much you are saving every sober day.
              </p>
            ) : null}
          </div>
          <button className="cta" onClick={() => setStep('spend')}>
            Continue
          </button>
        </>
      ) : null}

      {step === 'spend' ? (
        <>
          <h1>Weekly gambling spend</h1>
          <p className="s" style={{ marginTop: 6 }}>
            {result?.isAddict
              ? 'Required for your plan: how much do you usually spend gambling in a week? We will show what you save by staying sober.'
              : 'Roughly how much do you spend gambling in a normal week? We use it to show your money saved. You can skip this.'}
          </p>
          <h2>Currency</h2>
          <CurrencySelect value={currency} onChange={setCurrency} />
          <h2>Amount per week{result?.isAddict ? ' (required)' : ' (optional)'}</h2>
          <AmountInput
            value={weeklySpend}
            aria-invalid={!!spendError}
            aria-label="Amount spent gambling per week"
            onChange={(v) => {
              setWeeklySpend(v)
              if (spendError) setSpendError('')
            }}
          />
          {spendError ? (
            <span role="alert" className="field-error">
              {spendError}
            </span>
          ) : null}
          <button className="cta" style={{ marginTop: 20 }} onClick={handleFinish}>
            Start
          </button>
          {!result?.isAddict ? (
            <button
              className="ghost"
              onClick={() => {
                setWeeklySpend('')
                setSpendError('')
                onComplete({
                  name: name.trim(),
                  since: date || today(),
                  sinceTs: Date.now(),
                  country,
                  interests: sel,
                  assessment: result,
                  weeklySpend: '',
                  currency,
                })
              }}
            >
              Skip spending question
            </button>
          ) : null}
          <button className="ghost" onClick={() => setStep(result ? 'result' : 'test-offer')}>
            Back
          </button>
        </>
      ) : null}
    </Sheet>
  )
}
