import { defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig<DefaultThemeOptions>({
  lang: 'en-US',
  title: 'DNSLink Standard',
  description: 'Linking content with DNS TXT records.',
  markdown: {
    linkify: true
  }
})
