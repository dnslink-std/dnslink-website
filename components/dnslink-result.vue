<template>
  <pre v-if="result.error" class="error">{{ result.error.message }}</pre>
  <div v-else-if="result.entries" class="result">
    <div class="tabbar">
      <button :class="{selected: tab === 'out'}" @click="tab = 'out'">Output (stdout)</button>
      <button :class="{selected: tab === 'err'}" @click="tab = 'err'">Log (stderr)
        <div v-if="errorCount > 0" class="error-count">{{ errorCount }}</div>
      </button>
    </div>
    <div v-if="tab === 'out'">
      <table>
        <thead>
          <tr>
            <td>key</td>
            <td style="width: 100%">value</td>
            <td>ttl</td>
            <td>path</td>
          </tr>
        </thead>
        <tbody>
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <tr v-for="entry in result.entries">
            <td>{{entry.key}}</td>
            <td>{{entry.value}}</td>
            <td>{{entry.ttl}}</td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="tab === 'err'">
      <table>
        <thead>
          <tr>
            <td>type</td>
            <td>domain</td>
            <td style="width: 100%">entry</td>
            <td>reason</td>
            <td>path</td>
          </tr>
        </thead>
        <tbody>
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <tr v-for="entry in result.log">
            <td><abbr :title="codeInfo(entry.code)" :class="{ 'code--error': isErrorCode(entry.code)}">{{ entry.code }}</abbr></td>
            <td>{{ entry.domain }}</td>
            <td>{{ entry.entry }}</td>
            <td><abbr :title="reasonInfo(entry.reason)">{{ entry.title }}</abbr></td>
            <td>{{ pathToString(entry) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.error {
  background-color: var(--c-badge-warning);
  border-radius: 0.2em;
  margin-bottom: 0;
}
.result {
  border-radius: 0.2em;
  overflow: hidden;
  margin-top: 0.75em;
  color: #fff;
  background: var(--code-bg-color);
  &.inactive {
    opacity: 0.25;
  }
  .tabbar {
    display: flex;
    &, button {
      background: var(--code-hl-bg-color);
      border: 0;
    }
    button {
      position: relative;
      font-size: 1em;
      cursor: pointer;
      color: #fff;
      padding: .4em .75em;
      display: inline-block;
      border-top: 2px solid var(--code-hl-bg-color);

      &.selected {
        color: var(--c-brand);
        background: var(--code-bg-color);
        border-top-color: var(--c-brand);
      }
      &:focus {
        outline: 0;
        border-top-color: var(--c-brand);
      }
    }
    .error-count {
      border-radius: .9em;
      height: 1.8em;
      width: 1.8em;
      position: relative;
      background: var(--c-badge-warning);
      color: #000;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: .8em;
      margin-left: .5em;
    }
  }
  .code--error {
    color: var(--c-badge-warning);
  }
  table {
    min-width: 100%;
    margin: 0;
    tr {
      background-color: var(--c-hl-bg-color) !important;
      border: 1px solid var(--code-hl-bg-color);
    }
    td {
      white-space: nowrap;
      border: 0;
    }
    thead td {
      color: rgba(255, 255, 255, 0.55);
    }
  }
}
</style>
<script lang="ts">
import { LogCode, LogEntry, PathEntry } from '@dnslink/js'
import { defineComponent, ref, toRefs, computed } from 'vue'
export default defineComponent({
  props: {
    result: {
      type: Object,
      result: null
    }
  },
  setup: props => {
    const refs = toRefs(props)
    return ({
      ...refs,
      errorCount: computed(() => {
        const result = refs.result.value as unknown as { log: LogEntry[] }
        let errorCount = 0
        if (result && result.log) {
          for (const entry of result.log) {
            if (isErrorCode(entry.code)) {
              errorCount += 1
            }
          }
        }
        return errorCount
      }),
      tab: ref<'out' | 'err'>('out')
    })
  },
  methods: {
    pathToString (path: PathEntry): string {
      let result = path.pathname !== undefined ? path.pathname : ''
      let sep = '?'
      if (path.search) {
        for (const [key, values] of Object.entries(path.search)) {
          for (const value of values) {
            result += sep + encodeURIComponent(key) + '=' + encodeURIComponent(value)
            sep = '&'
          }
        }
      }
      return result
    },
    reasonInfo (reason: string): string {
      if (reason === 'NO_VALUE') {
        return 'An dnslink entry needs to have a value, like: dnslink=/key/value.'
      }
      if (reason === 'WRONG_START') {
        return 'A dnslink entry needs to start with a /.'
      }
      if (reason === 'KEY_MISSING') {
        return 'A dnslink entry needs to have a key, like: dnslink=/key/value.'
      }
      if (reason === 'INVALID_CHARACTER') {
        return 'A dnslink entry may only contain ascii characters.'
      }
      if (reason === 'INVALID_ENCODING') {
        return 'A dnslink entry uses percent encoding wrongly.'
      }
      if (reason === 'EMPTY_PART') {
        return 'A redirect may not contain empty parts.'
      }
      if (reason === 'TOO_LONG') {
        return 'A redirect domain may be max 253 characters which each subdomain not exceeding 63 characters.'
      }
      return ''
    },
    codeInfo (code: string): string {
      if (code === 'RESOLVE') {
        return 'Resolving from this domain.'
      }
      if (code === 'REDIRECT') {
        return 'Redirecting away from this domain.'
      }
      if (code === 'UNUSED_ENTRY') {
        return 'A redirect resulted in this entry to be ignored.'
      }
      if (code === 'CONFLICT_ENTRY') {
        return 'Another entry with the same key was preferred over this entry because the other entry is alphabetically earlier.'
      }
      if (code === 'ENDLESS_REDIRECT') {
        return 'Detected endless redirect.'
      }
      if (code === 'RECURSIVE_DNSLINK_PREFIX') {
        return 'Only one _dnslink. prefix can be used.'
      }
      if (code === 'INVALID_ENTRY') {
        return 'Entry misformatted, cant be used.'
      }
      return ''
    },
    isErrorCode
  }
})

function isErrorCode (code: LogCode): boolean {
  return code !== LogCode.redirect && code !== LogCode.resolve
}
</script>