import { object, typeGuards } from '@repo/utils'

const { safeJsonParse, isObject } = object()
const { isNumber } = typeGuards()

export { safeJsonParse, isObject, isNumber }
