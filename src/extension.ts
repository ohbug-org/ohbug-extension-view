import { createExtension } from '@ohbug/core'

import PageVisibility from './pageVisibility'
import captureUrlChange from './urlChange'

const extension = createExtension({
  name: 'OhbugExtensionView',
  init: () => {
    PageVisibility.capturePageVisibility()
    captureUrlChange()
  },
})

export default extension
