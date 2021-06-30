import { defineUserConfig } from 'vuepress'
import type { DefaultThemeOptions } from 'vuepress'

export default defineUserConfig<DefaultThemeOptions>({
  lang: 'en-US',
  title: 'DNSLink',
  description: 'Linking content and services with dns.',
  markdown: {
    linkify: true
  }
})
