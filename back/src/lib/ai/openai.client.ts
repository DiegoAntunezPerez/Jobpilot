import OpenAI from 'openai'
import { env } from '../../config/env'

let client: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!client) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no configurada')
    }
    client = new OpenAI({ apiKey: env.OPENAI_API_KEY })
  }
  return client
}

export async function chatComplete(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 800
): Promise<string> {
  const openai = getOpenAIClient()

  const completion = await openai.chat.completions.create({
    model: env.OPENAI_MODEL ?? 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    max_tokens: maxTokens,
    temperature: 0.6
  })

  return completion.choices[0]?.message?.content ?? ''
}
