<template>
  <pre v-if="result.error" class="error">{{ result.error.message }}</pre>
  <div v-else-if="result.entries && !advanced" class="simple--result simple--box">
    <ul v-if="result.entries.length > 0">
      <!-- eslint-disable-next-line vue/require-v-for-key -->
      <li v-for="entry in result.entries">dnslink=<span style="user-select: all">/{{entry.ns}}/{{entry.identifier}}</span></li>
    </ul>
    <div v-else>No DNSLink found</div>
  </div>
  <div v-else-if="result.entries && advanced" class="result">
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
            <td>namespace</td>
            <td style="width: 100%">indentifier</td>
            <td>ttl</td>
          </tr>
        </thead>
        <tbody v-if="result.entries.length > 0">
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <tr v-for="entry in result.entries">
            <td>{{entry.ns}}</td>
            <td>{{entry.identifier}}</td>
            <td>{{entry.ttl}}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="4" class="warning--no-result">&lt;No links specified&gt;</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="tab === 'err'">
      <table>
        <thead>
          <tr>
            <td>type</td>
            <td style="width: 100%">entry</td>
            <td>reason</td>
          </tr>
        </thead>
        <tbody>
          <!-- eslint-disable-next-line vue/require-v-for-key -->
          <tr v-for="entry in result.log">
            <td><abbr :title="CODE_MEANING[entry.code]" :class="{ 'code--error': isErrorCode(entry.code)}">{{ entry.code }}</abbr></td>
            <td>{{ entry.entry }}</td>
            <td><abbr :title="CODE_MEANING[entry.reason]">{{ entry.reason }}</abbr></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.error, .result, .simple--result {
  border-radius: 0.2em;
}
.error {
  background-color: var(--c-badge-warning);
  color: var(--c-warning-text);
  margin-bottom: 0;
}
.simple--result {
  margin-top: 0.35em;
  background: #fff;
  color: #000;
  padding: 1em;
  ul, li {
    list-style: none;
    padding: 0;
    margin: 0;
    white-space: nowrap;
  }
  overflow: auto;
}
.result {
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
  .code--error, .warning--no-result {
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
import { LogCode, LogEntry, CODE_MEANING } from '@dnslink/js'
import { defineComponent, ref, toRefs, computed } from 'vue'
export default defineComponent({
  props: {
    result: {
      type: Object,
      default: null
    },
    advanced: {
      type: Boolean,
      default: false
    }
  },
  setup: props => {
    const refs = toRefs(props)
    return {
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
      CODE_MEANING,
      tab: ref<'out' | 'err'>('out')
    }
  },
  methods: {
    isErrorCode
  }
})

function isErrorCode (code: LogCode): boolean {
  return code === LogCode.invalidEntry
}
</script>
