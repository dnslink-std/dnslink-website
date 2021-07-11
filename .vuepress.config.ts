import { defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig<DefaultThemeOptions>({
  lang: 'en-US',
  title: 'DNSLink Standard',
  description: 'Linking content with DNS TXT records.',
  markdown: {
    linkify: true
  },
  themeConfig: {
    editLink: true,
    docsDir: 'docs',
    docsRepo: 'https://github.com/dnslink-std/dnslink-website'
  }
})
