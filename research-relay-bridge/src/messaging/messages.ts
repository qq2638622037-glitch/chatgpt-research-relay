import { z } from 'zod'

const chatGptUrl = z
  .string()
  .url()
  .refine((value) => new URL(value).origin === 'https://chatgpt.com', {
    message: 'URL must use the approved ChatGPT origin',
  })

export const bridgeMessageSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('GET_STATE') }),
  z.object({ type: z.literal('SET_WORKER_ENTRY_CURRENT_TAB') }),
  z.object({
    type: z.literal('START_RELAY'),
    rawTask: z.string(),
    masterUrl: chatGptUrl,
  }),
  z.object({
    type: z.literal('TASK_POSTED'),
    rawTask: z.string(),
    observedUrl: chatGptUrl,
  }),
  z.object({ type: z.literal('CAPTURE_RESULT'), rawResult: z.string() }),
  z.object({
    type: z.literal('RESULT_POSTED'),
    rawResult: z.string(),
    observedUrl: chatGptUrl,
  }),
  z.object({ type: z.literal('RESUME_RELAY') }),
  z.object({ type: z.literal('CANCEL_RELAY') }),
])

export type BridgeMessage = z.infer<typeof bridgeMessageSchema>

export function isApprovedChatGptUrl(value?: string): boolean {
  if (!value) return false
  try {
    return new URL(value).origin === 'https://chatgpt.com'
  } catch {
    return false
  }
}
