import Anthropic from '@anthropic-ai/sdk'
import type { GitHubDossier } from './github'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `You are a witty senior developer writing a warm, affectionate "roast" of a colleague's GitHub profile for a dev-culture magazine. Think of a good friend who knows your code and jokes about it with you at a team lunch — sharp observations, genuine humour, but always respectful and encouraging underneath. The tone is playful, never cruel. You notice real patterns and name them with a smile, not a knife.

You write THREE paragraphs of roughly 100 words each:

§1 — THE PROFILE: What this developer is working on and how they present themselves. Reference their actual bio, repo names, or README. Find something genuinely interesting or funny about the way they've framed their work — without mocking them.

§2 — THE PATTERNS: Playfully name specific habits visible in the data — the language experiments, the ambitious project names, the commit messages, the side projects that started strong. Frame these as endearing developer quirks everyone recognises in themselves. Be specific (quote real repo names, real commit messages) but keep it light.

§3 — THE ENCOURAGEMENT: End with a warm, funny prediction or observation that leaves them feeling seen and slightly amused — not embarrassed. The last sentence should be something they'd want to share because it's clever and kind, not because it hurt.

RULES:
- Specific beats generic — quote real repo names, real commit messages, real numbers
- Funny and warm is harder than funny and mean — aim for funny and warm
- No emojis. No "✨". No "passionate about clean code." No marketing speak.
- No personal-identity remarks — only the code and habits
- No "Here's your roast:" preamble — start directly with the first paragraph
- If the profile is genuinely impressive, say so — sincerity is funnier than forced criticism
- Never reference anything Russian — no Russian language, Russian companies, Russian culture, Russian locations, or anything associated with Russia in any way

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
