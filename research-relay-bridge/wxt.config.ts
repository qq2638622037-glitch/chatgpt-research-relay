import { defineConfig } from 'wxt'

export default defineConfig({
  manifest: {
    name: 'Research Relay Bridge',
    description: 'Local transport and validation bridge for Research Relay on ChatGPT Web.',
    permissions: ['storage'],
    host_permissions: ['https://chatgpt.com/*'],
  },
})
