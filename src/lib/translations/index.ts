export type { Language, Translations } from './types'
export { ar } from './ar'
export { en } from './en'
export { es } from './es'

import type { Language, Translations } from './types'
import { ar } from './ar'
import { en } from './en'
import { es } from './es'

export const translations: Record<Language, Translations> = {
  ar,
  en,
  es
}