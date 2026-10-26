import { object } from '@repo/utils/object'
import { typeGuards } from '@repo/utils/type-guards'

const { safeJsonParse, isObject } = object()
const { isNumber } = typeGuards()

export { safeJsonParse, isObject, isNumber }
