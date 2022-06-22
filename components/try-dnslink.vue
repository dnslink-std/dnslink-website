<template>
  <div class="dnslink--container">
    <form @submit="onSubmit">
      <div class="input--advanced">
        <input type="checkbox" v-model="advanced" name="advanced" id="advanced">
        <label for="advanced">
          Advanced Mode
        </label>
      </div>
      <div v-if="!advanced" class="dnslink--simple simple--box">
        <div class="dnslink--simple--group">
          <input
            id="domain"
            name="domain"
            class="dnslink--simple--input"
            v-model="domain"
            @focus="selectInput"
            :placeholder="`eg. ${defaultDomain}`"
          >
        </div>
        <button type="submit" class="dnslink--simple--submit">{{ `Check DNSLink ${running ? '…' : '↵'}` }}</button>
      </div>
      <table v-else class="dnslink--input">
        <thead>
          <tr>
            <td>&gt;</td>
            <td>dnslink</td>
            <td>-d</td>
            <td>-f=csv</td>
            <td>-e=<input v-model="endpoint" class="advanced--input" style="width: 100px" /></td>
            <td width="100%">
              <input
                class="advanced--input"
                v-model="domain"
                @focus="selectInput"
                style="width: 100%; min-width: 150px;"
                :placeholder="`eg. ${defaultDomain}`"
              >
            </td>
            <td><button type="submit" class="advanced--submit">{{ running ? '…' : '↵' }}</button></td>
          </tr>
        </thead>
        <tbody>
          <tr class="info--buttons">
            <td>&nbsp;</td>
            <td><button type="button" @click="changeInfoTab('dnslink')" :class="{ selected: infoTab === 'dnslink' }" tabindex="0">ⓘ</button></td>
            <td><button type="button" @click="changeInfoTab('debug')" :class="{ selected: infoTab === 'debug' }" tabindex="0">ⓘ</button></td>
            <td><button type="button" @click="changeInfoTab('format')" :class="{ selected: infoTab === 'format' }" tabindex="0">ⓘ</button></td>
            <td><button type="button" @click="changeInfoTab('endpoint')" :class="{ selected: infoTab === 'endpoint' }" tabindex="0">ⓘ</button></td>
            <td></td>
          </tr>
          <tr :class="{ info: true, 'info--active': infoTab !== null, [`info--active--${String(infoTab)}`]: infoTab !== null }">
            <td colspan="8">
              <dl class="info">
                <dt>"dnslink"</dt>
                <dd class="info--tab--dnslink">
                  <p>We emulate the <code>dnslink</code> command line tool so you try to use it in the browser. The tool itself can be installed on your computer
                  using <code>npm install dnslink-std/js -g</code> or by <a href="https://github.com/dnslink-std/go#command-line" target="_blank">downloading the go binary</a>.</p></dd>
                <dt>"--debug"</dt>
                <dd class="info--tab--debug"><p>The <code>-d</code> flag (<code>--debug</code>) will add debug output to the stderr pipe.</p></dd>
                <dt>"-f=csv"</dt>
                <dd class="info--tab--format"><p>The <code>-f</code> option (<code>--format</code>) allows to format the output. We chose <code>csv</code> in this util for readability. If you install it on your
                  computer you will have other formats such as <code>json</code> and <code>text</code>.</p></dd>
                <dt>"-e={{ endpoint }}"</dt>
                <dd class="info--tab--endpoint">
                  <p>To resolve the DNS TXT entries this site, and many libraries use:
                    <a href="https://en.wikipedia.org/wiki/DNS_over_HTTPS" target="_blank">DNS over HTTPS</a> (DoH).
                    There are many, publically offered DoH resolvers.</p>
                  <details>
                    <summary>Browser-compatible endpoints registered at <a href="https://dnscrypt.org">DNSCrypt</a>.</summary>
                    <!-- eslint-disable-next-line vue/require-v-for-key -->
                    <ul v-for="known in endpoints">
                      <li>{{ known }}</li>
                    </ul>
                  </details>
                </dd>
              </dl>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
    <result :result="result" :class="{inactive: running}" :advanced="advanced" />
  </div>
</template>
<style lang="scss">
.simple--box {
  border: 1px solid #dfe2e5;
  background: #fff;
  border-radius: 0.2em;

  *::selection {
    background: #bcbcbc;
  }
}
.dnslink--simple {
  padding: 0.25em;
  display: flex;
  flex-wrap: nowrap;
  font-size: 1.35em;
}
.dnslink--simple--group, .dnslink--simple--submit {
  margin: 0.35em;
}
.advanced--submit {
  white-space: nowrap;
  margin-left: .75em;
  color: darken(#3eaf7c, 20) !important;
  background-color: lighten(#3eaf7c, 20) !important;
  border: 2px solid #3eaf7c !important;
  border-radius: .1em;
  &:focus {
    border-color: darken(#3eaf7c, 20) !important;
  }
  &:hover {
    background-color: lighten(#3eaf7c, 30) !important;
  }
}
.dnslink--simple--submit {
  font-size: 1em;
  white-space: nowrap;
  color: darken(#3eaf7c, 20);
  background-color: lighten(#3eaf7c, 20);
  border: 2px solid #3eaf7c;
  border-radius: .1em;
  padding: .2em;
  cursor: pointer;
  &:focus {
    border-color: darken(#3eaf7c, 20);
  }
  &:hover {
    background-color: lighten(#3eaf7c, 30);
  }
}
.dnslink--simple--group {
  flex-grow: 1;
  display: flex;
  align-items: center;
}
.dnslink--simple--input {
  width: 100%;
  flex-grow: 1;
  border: 1px solid #dfe2e5;
  background: white;
  color: black;
  &:focus {
    outline: none;
    border-color: var(--c-brand);
  }
}

@media (max-width: 960px) {
  .dnslink--simple {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
}
.input--advanced {
  margin-bottom: .3em;
  font-size: .8em;
  align-items: center;
  display: flex;
  justify-content: flex-end;
  label {
    user-select: none;
    color: #666;
  }
  &:hover, &:focus {
    label {
      color: black;
    }
  }
}
.input--advanced > * {
    cursor:pointer
}
.advanced--input, .dnslink--simple--input {
  font-size: 1em;
  border-radius: 0.2em;
  padding: 0.35em;
  margin-bottom: 0;
  background: #fff;
}
.advanced--input {
  height: 1.1em;
  background-color: var(--code-bg-color);
  border: 1px solid #666;
  color: #fff;

  &:focus {
    outline: none;
    border-color: var(--c-brand);
  }
}
.dnslink--container {
  padding: 0;
  transition: background-color var(--t-color);
}
.dnslink--input {
  border: none;
  margin: 0;
  white-space: nowrap;
  padding: 0.3em;
  border-radius: 0.25em;
  &, .domain-input, select {
    font-family: var(--font-family-code);
  }
  &, td, th, tr {
    border: 0;
    background: var(--code-bg-color);
  }
  td {
    padding: 0;
    margin: 0;
    border: none;
    padding-left: 0.5em;
  }
  tbody td {
    text-align: center;
    color: #ccc;
  }
  thead {
    td {
      color: #fff;
      padding-bottom: 0.4em;
    }
    tr {
      border-bottom: 1px solid var(--code-hl-bg-color);
    }
  }
  select {
    width: 8em;
    color: #fff;
    padding: 0.1em;
    border-radius: 0.2em;
    background-color: var(--code-bg-color);
    border: 1px solid #666;

    &:focus {
      outline: none;
      border-color: var(--c-brand);
    }
  }
  button {
    height: 1.4em;
    font-size: 1em;
    background-color: var(--code-bg-color);
    border: 1px solid #666;
    color: #ccc;
    border-radius: 0.2em;
    cursor: pointer;

    &:focus {
      color: var(--c-brand);
      border-color: var(--c-brand);
      outline: none;
    }
  }
  .info {
    display: none;
    dt, dd {
      display: none;
    }
    &.info--active {
      code {
        color: #4e6e8e;
        background: #fff;
      }
      td {
        background: #f3f4f5;
        color: #000;
        text-align: left;
        border-radius: 0.1em;
      }
      display: table-row;
      border-top: none;
      dl {
        display: block;
        white-space: normal;
      }
      summary {
        padding-left: 0.5em;
        margin-bottom: 0.5em;
        cursor: pointer;
        user-select: none;
      }
      details {
        margin-bottom: 0.5em;
      }
      li {
        margin-left: 0.5em;
      }
    }
    &.info--active--dnslink .info--tab--dnslink,
    &.info--active--debug .info--tab--debug,
    &.info--active--format .info--tab--format,
    &.info--active--endpoint .info--tab--endpoint {
      display: block!important;
      font-family: var(--font-family);
    }
    dd, p, dl {
      margin: 0;
    }
    p {
      margin: 0.6em 0.4em;
    }
  }
  .info--buttons button {
    margin-top: 0.2em;
    width: 100%;
    border: 0;
    height: 100%;
    color: #ccc;
    display: block;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    &:focus, &:hover, &.selected {
      color: #fff;
    }
    &.selected {
      background-color: #f3f4f5;
      color: #000;
    }
  }
  .vs__search::placeholder,
  .vs__dropdown-toggle,
  .vs__dropdown-menu {
    background: #dfe5fb;
    border: none;
    color: #394066;
    text-transform: lowercase;
    font-variant: small-caps;
  }

  .vs__clear,
  .vs__open-indicator {
    fill: #394066;
  }
}
</style>
<script lang="ts">
import { ref, defineComponent } from 'vue'
import { resolve, LogEntry, Links } from '@dnslink/js'
import { wellknown }  from 'dns-query'
import debounce from 'lodash.debounce'
import Result from './dnslink-result.vue'

const FALLBACK_ENDPOINT = 'dns.google'
const INPUT_DEBOUNCE = 450

export default defineComponent({
  components: {
    result: Result
  },
  methods: {
    selectInput (e: FocusEvent) {
      (e.target as HTMLInputElement).select()
    }
  },
  setup () {
    const defaultDomain = 'en.wikipedia-on-ipfs.org'
    const running = ref(false)
    const domain = ref(defaultDomain)
    const advanced = ref(false)
    const endpoints = ref<string[]>([FALLBACK_ENDPOINT])
    wellknown.data().then(
      data => {
        endpoints.value = data.endpoints.map((e: any) => {
          e.name = null
          e.ipv4 = null
          e.ipv6 = null
          return String(e)
        }).sort()
        const e: any = 
        endpoint.value = String(
          data.endpointByName.google || data.endpointByName.cloudflare || data.endpoints[0] || FALLBACK_ENDPOINT
        )
      },
      () => {}
    )
    const endpoint = ref<string>('')
    const infoTab = ref<string | null>(null)
    const result = ref<{
      domain?: string,
      error?: Error,
      entries?: {}[],
      log?: LogEntry[]
    }>({})
    let controller: AbortController | undefined
    const start = debounce(() => {
      if (controller) controller.abort()
      if (!domain.value) {
        return
      }
      const mine = new AbortController()
      controller = mine

      running.value = true
      let value = domain.value
      resolve(value, {
        signal: controller.signal,
        endpoints: [endpoint.value]
      }).then(
        next(_result => {
          result.value = {
            domain: value,
            entries: linksToEntries(_result.links),
            log: _result.log
          }
        }),
        next(error => {
          console.error(error)
          result.value = { error }
        })
      )

      function next <T>(op: (input: T) => void): (input: T)  => void {
        return function () {
          if (controller === mine) {
            op.apply(null, arguments)
            controller = undefined
            running.value = false
          }
        }
      }
    }, INPUT_DEBOUNCE)
    return {
      defaultDomain,
      infoTab,
      changeInfoTab (target: string): (e: Event) => void {
        infoTab.value = (infoTab.value === target) ? null : target
        return (e: Event): void => {
          console.log(e)
        }
      },
      result,
      running,
      domain,
      advanced,
      onSubmit (e: Event): void {
        if (e) e.preventDefault()
        start()
      },
      endpoints,
      endpoint
    }
  }
})

function linksToEntries (links: Links) {
  const entries = []
  for (const ns in links) {
    for (const link of links[ns]) {
      entries.push({
        ns,
        identifier: link.identifier,
        ttl: link.ttl
      })
    }
  }
  return entries
}
</script>
