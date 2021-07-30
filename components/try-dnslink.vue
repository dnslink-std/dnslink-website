<template>
  <div class="dnslink--container">
    <form @submit="onSubmit">
      <div class="input--advanced">
        <input type="checkbox" v-model="advanced"> Advanced Mode
      </div>
      <div v-if="!advanced" class="dnslink--simple">
        <label>Domain: </label>
        <input
          class="domain--simple--input"
          v-model="domain"
          placeholder="eg. dnslink.dev"
        >
        <button type="submit">{{ `Check DNSLink ${running ? '…' : '↵'}` }}</button>
      </div>
      <table v-else class="dnslink--input">
        <thead>
          <tr :class="{ info: true, 'info--active': infoTab !== null, [`info--active--${String(infoTab)}`]: infoTab !== null }">
            <td colspan="7">
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
                <dt>"--doh="</dt>
                <dd class="info--tab--doh">
                  <p>To resolve the DNS TXT entries this site, and many libraries use:
                    <a href="https://en.wikipedia.org/wiki/DNS_over_HTTPS" target="_blank">DNS over HTTPS</a> (DoH).
                    There are many, publically offered DoH resolvers, we use this select list of resolvers we know
                    to work in the browser.</p>
                  <p>About "{{ doh.name }}": <a :href="doh.endpoint.docs" target="_blank">{{ doh.endpoint.docs }}</a><br/>
                    URL for the lookup: <a :href="endpointToString(doh.endpoint)" target="_blank">{{ endpointToString(doh.endpoint) }}</a><br/>
                  <span v-if="doh.endpoint.location">Location: {{ doh.endpoint.location }}</span></p>
                </dd>
              </dl>
            </td>
          </tr>
          <tr class="info--buttons">
            <td>&nbsp;</td>
            <td><button type="button" @click="changeInfoTab('dnslink')" :class="{ selected: infoTab === 'dnslink' }" tabindex="0">ⓘ</button></td>
            <td><button type="button" @click="changeInfoTab('debug')" :class="{ selected: infoTab === 'debug' }" tabindex="0">ⓘ</button></td>
            <td><button type="button" @click="changeInfoTab('format')" :class="{ selected: infoTab === 'format' }" tabindex="0">ⓘ</button></td>
            <td><button type="button" @click="changeInfoTab('doh')" :class="{ selected: infoTab === 'doh' }" tabindex="0">ⓘ</button></td>
            <td></td>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>&gt;</td>
            <td>dnslink</td>
            <td>-d</td>
            <td>-f=csv</td>
            <td>--doh=<select v-model="doh">
              <option
                v-for="endpoint in endpointList"
                :key="endpoint"
                :value="endpoint"
                :selected="endpoint.name === doh.name"
              >{{ endpoint.name }}</option>
              </select>
            </td>
            <td style="width: 100%;">
              <input
                class="domain--input"
                v-model="domain"
                placeholder="eg. dnslink.dev"
              >
            </td>
            <td><button type="submit">{{ running ? '…' : '↵' }}</button></td>
          </tr>
        </tbody>
      </table>
    </form>
    <result :result="result" :class="{inactive: running}" />
  </div>
</template>
<style lang="scss">
.dnslink--simple {
  border: 1px solid #dfe2e5;
  background: #fff;
  border-radius: 0.2em;
  padding: 0.5em;
  display: flex;
  align-items: center;
  font-size: 1.35em;
  label {
    margin-right: 0.5em;
  }
  button {
    margin-left: 0.35em;
    font-size: 1em;
    color: darken(#3eaf7c, 20);
    background-color: lighten(#3eaf7c, 20);
    border: 2px solid #3eaf7c;
    border-radius: 0.25em;
    cursor: pointer;
    &:focus {
      border-color: darken(#3eaf7c, 20);
    }
    &:hover {
      background-color: lighten(#3eaf7c, 30);
    }
  }
}
.input--advanced {
  margin-top: .3em;
  font-size: .8em;
  align-items: center;
  display: flex;
  justify-content: flex-end;
}
.domain--simple--input {
  border: 1px solid #dfe2e5;
  flex-grow: 1;
  &:focus {
    outline: none;
    border-color: var(--c-brand);
  }
}
.domain--input, .domain--simple--input {
  font-size: 1em;
  border-radius: 0.2em;
  padding: 0.1em;
  margin-bottom: 0;
}
.domain--input {
  width: 60%;
  width: 100%;
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
  padding: 1em;
  background: #f0f0f0;
  color: black;
}
.dnslink--input {
  border: none;
  padding: 0;
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
  thead td {
    color: #ccc;
  }
  tbody td {
    color: #fff;
  }
  td {
    padding: 0;
    margin: 0;
    border: none;
    padding-left: 0.5em;
  }
  thead tr {
    border-bottom: 1px solid var(--code-hl-bg-color);
  }
  thead td {
    text-align: center;
    padding-bottom: 0;
  }
  tbody td {
    padding-top: 0.4em;
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
      margin-top: 0.5em;
      td {
        background: var(--c-bg-light);
        color: var(--c-light);
        text-align: left;
        border-radius: 0.1em;
      }
      display: table-row;
      border-bottom: none;
      dl {
        display: block;
        white-space: normal;
      }
    }
    &.info--active--dnslink .info--tab--dnslink,
    &.info--active--debug .info--tab--debug,
    &.info--active--format .info--tab--format,
    &.info--active--doh .info--tab--doh {
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
    width: 100%;
    border: 0;
    height: 100%;
    color: #ccc;
    display: block;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
    &:focus, &:hover, &.selected {
      color: #fff;
    }
    &.selected {
      background-color: var(--c-bg-light);
      color: var(--code-bg-color);
    }
  }
}
</style>
<script lang="ts">
import { ref, defineComponent } from 'vue'
import { resolveN, LogEntry, createLookupTXT } from '@dnslink/js'
import { endpoints, Endpoint }  from 'dns-query'
import debounce from 'lodash.debounce'
import Result from './dnslink-result.vue'

const endpointList = Object
  .entries(endpoints)
  .filter(([name, endpoint]) => endpoint.cors || name === 'google')
  .map(([name, endpoint]) => ({ name, endpoint }))
  .sort((a, b) => {
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })

const INPUT_DEBOUNCE = 450

export default defineComponent({
  components: {
    result: Result
  },
  methods: {
    endpointToString
  },
  setup () {
    const running = ref(false)
    const domain = ref()
    const advanced = ref(false)
    const doh = ref<{ name: string, endpoint: Endpoint }>({ name: 'cloudflare', endpoint: endpoints.cloudflare })
    const infoTab = ref<string | null>(null)
    const result = ref<{
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
      resolveN(domain.value, {
        signal: controller.signal as unknown as any /* problem with outdated AbortController */,
        lookupTXT: createLookupTXT({ endpoints: [doh.value.endpoint]})
      }).then(
        next(_result => {
          result.value = {
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
      doh,
      advanced,
      onSubmit (e: Event): void {
        if (e) e.preventDefault()
        start()
      },
      endpoints,
      endpointList
    }
  }
})

function linksToEntries (links: { [key: string]: Array<{ value: string, ttl: number }>}) {
  const entries = []
  for (const key in links) {
    for (const link of links[key]) {
      entries.push({
        key,
        value: link.value,
        ttl: link.ttl
      })
    }
  }
  return entries
}

function endpointToString (endpoint: Endpoint): string {
  if (!endpoint) return ''
  return `https://${endpoint.host}${endpoint.port ? `:${endpoint.port}` : '' }${ endpoint.path || '/dns-query' }`
}
</script>
