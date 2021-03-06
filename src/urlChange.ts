import { replace, parseUrl } from '@ohbug/utils'

import { sendPageView } from './createEvent'

let lastHref: string | undefined

function handleUrlChange(from?: string, to?: string) {
  const parsedHref = parseUrl(window?.location?.href)
  let parsedFrom = parseUrl(from as string)
  const parsedTo = parseUrl(to as string)

  if (!parsedFrom.path) {
    parsedFrom = parsedHref
  }

  lastHref = to

  let targetFrom = from
  let targetTo = to

  if (
    parsedHref.protocol === parsedTo.protocol &&
    parsedHref.host === parsedTo.host
  ) {
    targetTo = parsedTo.relative
  }
  if (
    parsedHref.protocol === parsedFrom.protocol &&
    parsedHref.host === parsedFrom.host
  ) {
    targetFrom = parsedFrom.relative
  }
  if (targetFrom === targetTo) return

  sendPageView(targetTo!)
}

function historyReplacement(
  original: (data: any, title: string, url?: string) => void
) {
  return function call(data: any, title: string, url?: string) {
    if (url) {
      handleUrlChange(lastHref, String(url))
    }
    return original.apply(this, [data, title, url])
  }
}

const historyOriginal = {
  pushState: window?.history?.pushState,
  replaceState: window?.history?.replaceState,
  onpopstate: window?.onpopstate,
}
function historyListener() {
  historyOriginal.pushState = replace(
    window?.history,
    'pushState',
    historyReplacement
  )
  historyOriginal.replaceState = replace(
    window?.history,
    'replaceState',
    historyReplacement
  )
  historyOriginal.onpopstate = replace(window, 'onpopstate', () => {
    const current = window?.location?.href
    handleUrlChange(lastHref, current)
  })
}

function hashListener(e: HashChangeEvent) {
  const { oldURL, newURL } = e
  handleUrlChange(oldURL, newURL)
}

/**
 * 如果 URL 发生变化 发送新的 Page View 统计
 */
function captureUrlChange() {
  // history
  historyListener()
  // hash
  window?.addEventListener?.('hashchange', hashListener, true)
}

export default captureUrlChange
