import type { GitHubDossier } from '@/lib/github'

export default function StatsCard({ d }: { d: GitHubDossier }) {
  const stats = [
    { label: 'Repos surveyed', value: d.publicRepos },
    { label: 'Dead repos', value: d.deadRepos },
    { label: 'Ghost repos', value: d.ghostRepos },
    { label: 'Language hops', value: d.languageHops },
    { label: 'Followers', value: d.followers },
    { label: 'Account age', value: `${d.accountAgeYears}yr` },
  ]

  return (
    <aside className="col-rule pl-6 space-y-4">
      <p className="mono-label mb-6">STATISTICS</p>
      {stats.map(s => (
        <div key={s.label}>
          <p className="mono-label" style={{ fontSize: '0.7rem' }}>{s.label}</p>
          <p className="font-mono text-xl font-medium" style={{ color: 'var(--fg)' }}>
            {s.value}
          </p>
        </div>
      ))}
      {d.languages.length > 0 && (
        <div className="pt-4 border-t border-[var(--border)]">
          <p className="mono-label mb-3" style={{ fontSize: '0.7rem' }}>LANGUAGES</p>
          {d.languages.slice(0, 5).map(l => (
            <div key={l.name} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="font-mono text-xs">{l.name}</span>
                <span className="font-mono text-xs opacity-60">{l.percent}%</span>
              </div>
              <div className="h-px mt-1" style={{ background: 'var(--border)' }}>
                <div
                  className="h-px"
                  style={{ width: `${l.percent}%`, background: 'var(--crimson)' }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="pt-4 border-t border-[var(--border)]">
        <p className="mono-label mb-1" style={{ fontSize: '0.7rem' }}>LAST MEANINGFUL COMMIT</p>
        <p className="font-mono text-xs opacity-70 break-words">"{d.lastMeaningfulCommit}"</p>
      </div>
    </aside>
  )
}
