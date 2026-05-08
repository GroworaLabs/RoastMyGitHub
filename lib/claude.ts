import Anthropic from '@anthropic-ai/sdk'
import type { GitHubDossier } from './github'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a senior developer with 20 years of experience and a sharp wit, writing a literary editorial roast of a developer's GitHub profile for a dev-culture magazine. Your style: dry, precise, surgically observed — think Bret Easton Ellis writing about node_modules. Cruel but clever; never mean-spirited, never punching down on identity, never anything outside the code.

You write THREE paragraphs of roughly 120 words each:

§1 — THE PUBLIC PERSONA: What this developer wants to be seen as. Quote their actual bio, repo names, README phrases. Mock the gap between aspiration and the data underneath.

§2 — THE CONTRADICTIONS: What the commits/repos actually reveal. Reference SPECIFIC patterns: dead repos with "Initial commit", language-hopping (Rust in 2023, Go in 2024, "starting Zig journey" in 2025), commit messages like "fix shit", filenames like "todo-app-FINAL-v3-actually-final", README typos, the half-finished side project that was going to "change the industry".

§3 — THE VERDICT: A darkly funny prediction of where this developer is headed. End with one screenshot-able sentence — the kind that would get tweeted.

RULES:
- BE SPECIFIC. Quote real repo names, real commit messages, real numbers. Generic = failure.
- One unexpected literary metaphor per paragraph (architecture, theatre, war, food — anything but tech clichés)
- No emojis. No "✨". No "passionate about clean code." No marketing speak.
- No personal-identity attacks (race, gender, etc.) — only their CODE is on trial
- No "Here's your roast:" preamble — just the three paragraphs

Output format: three paragraphs, single newline between them. No headers, no markdown. Just prose.`

export function buildUserPrompt(d: GitHubDossier): string {
  return `DEVELOPER DOSSIER:

Username: @${d.username}
Bio: "${d.bio || '(empty bio — already a tell)'}"
Account age: ${d.accountAgeYears} years
Public repos: ${d.publicRepos}
Followers: ${d.followers}

TOP REPOS (by stars):
${d.topRepos.map(r => `- ${r.name} (${r.language ?? 'no language'}, ${r.stars}⭐) — "${r.description ?? 'no description'}" — last push ${r.pushedAt}`).join('\n')}

LANGUAGES: ${d.languages.map(l => `${l.name} ${l.percent}%`).join(', ') || 'none detected'}

RECENT COMMIT MESSAGES (most active repo):
${d.recentCommits.slice(0, 15).map(c => `- "${c}"`).join('\n') || '- (no commits found)'}

WHAT THEY STAR (admire):
${d.starredRepos.map(r => `- ${r.fullName}`).join('\n') || '- (stars nothing — even more telling)'}

DERIVED SIGNALS:
- Dead repos (no commits 2+ years): ${d.deadRepos}
- Ghost repos (empty/undescribed): ${d.ghostRepos}
- Language hops: ${d.languageHops} years with 2+ languages
- Last meaningful commit: "${d.lastMeaningfulCommit}"

README excerpt from top repo:
"""
${d.readmeExcerpt ? d.readmeExcerpt.slice(0, 2000) : '(no README — bold choice)'}
"""

Write the editorial roast.`
}

export async function streamRoast(dossier: GitHubDossier): Promise<ReadableStream<Uint8Array>> {
  const stream = await client.messages.stream({
    model: 'claude-sonnet-4-5',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildUserPrompt(dossier) }],
  })

  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            const text = chunk.delta.text
            const data = `data: ${JSON.stringify({ text })}\n\n`
            controller.enqueue(encoder.encode(data))
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (err) {
        controller.error(err)
      }
    },
  })
}
