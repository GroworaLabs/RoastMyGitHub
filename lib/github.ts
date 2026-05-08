import { Octokit } from '@octokit/rest'

export interface GitHubDossier {
  username: string
  name: string | null
  bio: string | null
  location: string | null
  company: string | null
  createdAt: string
  accountAgeYears: number
  followers: number
  publicRepos: number
  avatarUrl: string
  topRepos: RepoSummary[]
  starredRepos: StarredRepo[]
  recentCommits: string[]
  languages: LanguageStat[]
  readmeExcerpt: string
  deadRepos: number
  ghostRepos: number
  languageHops: number
  lastMeaningfulCommit: string
}

interface RepoSummary {
  name: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  pushedAt: string
  hasReadme: boolean
}

interface StarredRepo {
  fullName: string
}

interface LanguageStat {
  name: string
  percent: number
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
  log: { debug: () => {}, info: () => {}, warn: () => {}, error: () => {} },
})

const TWO_YEARS_AGO = new Date(Date.now() - 2 * 365 * 24 * 60 * 60 * 1000)

function formatRelative(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 1) return 'today'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`
  return `${Math.floor(diffDays / 365)} years ago`
}

export async function fetchGitHubDossier(username: string): Promise<GitHubDossier> {
  const [userRes, reposRes, starredRes] = await Promise.all([
    octokit.users.getByUsername({ username }),
    octokit.repos.listForUser({
      username,
      sort: 'pushed',
      per_page: 100,
      type: 'owner',
    }),
    octokit.activity.listReposStarredByUser({ username, per_page: 5 }),
  ])

  const user = userRes.data
  const allRepos = reposRes.data

  // Top 10 by stars
  const topRepos: RepoSummary[] = [...allRepos]
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, 10)
    .map(r => ({
      name: r.name,
      description: r.description ?? null,
      language: r.language ?? null,
      stars: r.stargazers_count ?? 0,
      forks: r.forks_count ?? 0,
      pushedAt: formatRelative(r.pushed_at ?? r.created_at ?? ''),
      hasReadme: false,
    }))

  const starredRepos: StarredRepo[] = (starredRes.data as Array<{ full_name: string }>).map(r => ({
    fullName: r.full_name,
  }))

  // Language breakdown across top 20 repos by stars
  const top20 = [...allRepos]
    .sort((a, b) => (b.stargazers_count ?? 0) - (a.stargazers_count ?? 0))
    .slice(0, 20)

  const langBytes: Record<string, number> = {}
  await Promise.allSettled(
    top20.map(async repo => {
      try {
        const langRes = await octokit.repos.listLanguages({
          owner: username,
          repo: repo.name,
        })
        for (const [lang, bytes] of Object.entries(langRes.data)) {
          langBytes[lang] = (langBytes[lang] ?? 0) + (bytes as number)
        }
      } catch {
        // ignore
      }
    })
  )

  const totalBytes = Object.values(langBytes).reduce((a, b) => a + b, 0)
  const languages: LanguageStat[] = Object.entries(langBytes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, bytes]) => ({
      name,
      percent: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
    }))

  // Recent commits from most recently pushed non-fork repo
  const activeRepo = allRepos
    .filter(r => !r.fork)
    .sort((a, b) => new Date(b.pushed_at ?? 0).getTime() - new Date(a.pushed_at ?? 0).getTime())[0]

  let recentCommits: string[] = []
  let readmeExcerpt = ''

  if (activeRepo) {
    const [commitsRes, readmeRes] = await Promise.allSettled([
      octokit.repos.listCommits({
        owner: username,
        repo: activeRepo.name,
        per_page: 30,
        author: username,
      }),
      octokit.repos.getReadme({ owner: username, repo: activeRepo.name }),
    ])

    if (commitsRes.status === 'fulfilled') {
      recentCommits = commitsRes.value.data
        .map(c => c.commit.message.split('\n')[0])
        .filter(Boolean)
    }

    if (readmeRes.status === 'fulfilled') {
      const raw = Buffer.from(readmeRes.value.data.content, 'base64').toString('utf-8')
      readmeExcerpt = raw.slice(0, 3000)
    }
  }

  // Derived signals
  const deadRepos = allRepos.filter(
    r => !r.fork && new Date(r.pushed_at ?? r.created_at ?? '') < TWO_YEARS_AGO
  ).length

  const ghostRepos = allRepos.filter(
    r => !r.fork && (r.size === 0 || (r.description === null && (r.stargazers_count ?? 0) === 0))
  ).length

  // Language hopping: count distinct languages used across repos by year
  const langByYear: Record<string, Set<string>> = {}
  for (const repo of allRepos) {
    if (!repo.language || !repo.pushed_at) continue
    const year = new Date(repo.pushed_at).getFullYear().toString()
    if (!langByYear[year]) langByYear[year] = new Set()
    langByYear[year].add(repo.language)
  }
  const languageHops = Object.values(langByYear).filter(s => s.size >= 2).length

  // Last meaningful commit (non-"Initial commit", non-merge)
  const meaningful = recentCommits.find(
    msg =>
      !msg.toLowerCase().includes('initial commit') &&
      !msg.toLowerCase().startsWith('merge') &&
      msg.length > 5
  )
  const lastMeaningfulCommit = meaningful
    ? meaningful.slice(0, 60)
    : recentCommits[0]?.slice(0, 60) ?? 'unknown'

  const createdAt = user.created_at ?? new Date().toISOString()
  const accountAgeYears = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (365 * 24 * 60 * 60 * 1000)
  )

  return {
    username,
    name: user.name ?? null,
    bio: user.bio ?? null,
    location: user.location ?? null,
    company: user.company ?? null,
    createdAt,
    accountAgeYears,
    followers: user.followers ?? 0,
    publicRepos: user.public_repos ?? 0,
    avatarUrl: user.avatar_url ?? '',
    topRepos,
    starredRepos,
    recentCommits,
    languages,
    readmeExcerpt,
    deadRepos,
    ghostRepos,
    languageHops,
    lastMeaningfulCommit,
  }
}
