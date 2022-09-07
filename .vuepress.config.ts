import { defineUserConfig } from 'vuepress'
import { defaultTheme } from '@vuepress/theme-default'
import { registerComponentsPlugin } from '@vuepress/plugin-register-components'
import { path } from '@vuepress/utils'

const componentsDir = path.resolve(__dirname, './components')

export default defineUserConfig({
  lang: 'en-US',
  title: 'DNSLink Standard',
  description: 'Linking content with DNS TXT records.',
  plugins: [
    registerComponentsPlugin({
      componentsDir,
      getComponentName: (filename) =>  {
        const componentName = path.trimExt(filename.replace(/\/|\\/g, '-'))
        console.log(`Known Component ${componentName} → ${filename}`)
        return componentName
      }
    })
  ],
  markdown: {
    code: {
        lineNumbers: false
    },
    linkify: true
  },
  theme: defaultTheme({
    editLink: true,
    docsDir: 'docs',
    docsRepo: 'https://github.com/dnslink-std/dnslink-website'
  })
})
