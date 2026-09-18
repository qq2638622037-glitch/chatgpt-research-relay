export default defineContentScript({
  matches: ['https://chatgpt.com/*'],
  runAt: 'document_idle',
  main() {
    // Stage 4D will add protocol-block detection and inline controls.
    // Keep Stage 4A intentionally inert on page content.
  },
})
