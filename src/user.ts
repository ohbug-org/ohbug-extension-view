import Cookies from 'js-cookie'
import dayjs from 'dayjs'

import { sendUserView } from './createEvent'

const NAME = 'OhbugExtensionViewUV'

/**
 * initial page view 触发时同时触发
 * 先从 cookie 内取值
 * 没有值     => 创建 cookie 并记一次 uv
 * 有值(当天) => 不动
 * 有值(昨天) => 更新 cookie 并记一次 uv
 * 有值(明天) => 不动 (不应出现这个情况)
 */
function createUserView(path: string) {
  const value = Cookies.get(NAME)

  // 没有值     => 创建 cookie 并记一次 uv
  if (!value) {
    Cookies.set(NAME, dayjs().toISOString(), { expires: 30 })
    sendUserView(path)
  } else {
    const parsedValue = dayjs(value)
    // 有值(昨天) => 更新 cookie 并记一次 uv
    if (parsedValue.isBefore(dayjs(), 'day')) {
      Cookies.set(NAME, dayjs().toISOString(), { expires: 30 })
      sendUserView(path)
    }
  }
}

export default createUserView
