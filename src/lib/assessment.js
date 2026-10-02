// Brief gambling-risk self-test (PGSI-inspired, for self-reflection only).
// Not a medical diagnosis. Kept on-device.

export const ASSESS_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: 'Sometimes' },
  { value: 2, label: 'Most of the time' },
  { value: 3, label: 'Almost always' },
]

export const ASSESS_QUESTIONS = [
  'Have you bet more than you could really afford to lose?',
  'Have you needed to gamble with larger amounts to get the same excitement?',
  'Have you gone back another day to try to win back money you lost?',
  'Have you borrowed money or sold anything to fund gambling?',
  'Have you felt that gambling might be a problem for you?',
  'Has gambling caused stress, anxiety, or guilt for you?',
  'Have people criticised your betting or told you that you gamble too much?',
  'Has gambling caused financial problems for you or your household?',
  'Have you felt you could not stop gambling even when you wanted to?',
]

export function scoreAssessment(answers) {
  const total = (answers || []).reduce((s, v) => s + (Number(v) || 0), 0)
  let level = 'none'
  let title = 'No signs of problem gambling'
  let blurb =
    'Your answers do not show signs of problem gambling right now. Staying aware of your habits is still a strong protective step.'
  if (total >= 8) {
    level = 'problem'
    title = 'Signs of problem gambling'
    blurb =
      'Your answers suggest gambling is harming you — this is the point where support, blockers and a weekly spending check-in help most. This is not a diagnosis, just an honest signal to act on.'
  } else if (total >= 3) {
    level = 'moderate'
    title = 'Moderate risk'
    blurb =
      'Your answers show some risky patterns. Gambling may be starting to control more than you want it to. Setting a weekly spend limit and protections now can stop it growing.'
  } else if (total >= 1) {
    level = 'low'
    title = 'Low risk'
    blurb =
      'Your answers show a little risk. Most people at this stage stay in control by tracking spend and keeping blockers on.'
  }
  return { score: total, level, title, blurb, isAddict: total >= 3 }
}
