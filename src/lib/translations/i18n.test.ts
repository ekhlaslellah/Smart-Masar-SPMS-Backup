import test from 'node:test'
import assert from 'node:assert/strict'
import { translations } from './index'

test('Arabic (ar) and English (en) translation dictionaries exist and have matching top-level namespaces', () => {
  assert.ok(translations.ar, 'Arabic translations should be defined')
  assert.ok(translations.en, 'English translations should be defined')

  const arKeys = Object.keys(translations.ar).sort()
  const enKeys = Object.keys(translations.en).sort()
  assert.deepEqual(arKeys, enKeys, 'Top-level translation namespaces must match between ar and en')
})

test('Arabic translations contain Smart Masar SPMS terminology and all keys match English keys', () => {
  assert.ok(
    translations.ar.auth.performanceManagementSystem.includes('سمارت مسار'),
    'Arabic auth title should include Smart Masar branding'
  )

  for (const namespace of Object.keys(translations.en) as Array<keyof typeof translations.en>) {
    const enSection = translations.en[namespace]
    const arSection = translations.ar[namespace]
    assert.deepEqual(
      Object.keys(arSection).sort(),
      Object.keys(enSection).sort(),
      `Keys in namespace "${String(namespace)}" must match between ar and en`
    )
  }
})
