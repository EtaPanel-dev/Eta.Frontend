export default defineNuxtPlugin((nuxtApp) => {
  if (process.server) {
    const event = nuxtApp.ssrContext?.event
    const colorScheme = event?.node.req.headers['sec-ch-prefers-color-scheme'] || 
                       (event?.node.req.headers['user-agent']?.includes('Dark') ? 'dark' : 'light')
    
    nuxtApp.ssrContext!.head = nuxtApp.ssrContext!.head || []
    nuxtApp.ssrContext!.head.push(`<script>document.documentElement.classList.toggle('dark', '${colorScheme}' === 'dark' || window.matchMedia('(prefers-color-scheme: dark)').matches)</script>`)
  }
})