import type { DistinctQuestion } from 'inquirer'
import type { TenantContext } from '../models'
import { validateHex } from '../helpers'

const tenantPrompts = (ctx: TenantContext): DistinctQuestion[] => {
  const prompts: DistinctQuestion[] = [
  {
    type: 'input',
    name: 'name',
    message: "Tenant name (kebab-case, e.g. 'my-tenant'):",
    validate: (input: string) =>
      /^[a-z][a-z0-9-]*$/.test(input) ||
      'Enter kebab-case name (lowercase, hyphens allowed)',
  },
  {
    type: 'input',
    name: 'description',
    message: 'Short description:',
  },
  {
    type: 'list',
    name: 'metadataMode',
    message: 'Metadata generation mode:',
    choices: [
      {
        name: 'Generate a random placeholder entries data in metadata.ts file',
        value: 'fixture',
      },
      { name: 'None — skip placeholders in metadata.ts', value: 'none' },
    ],
  },
  {
    type: 'list',
    name: 'theme',
    message: 'Design theme:',
    choices: [
      { name: 'Default — clean, minimal base', value: 'default' },
      { name: 'Cyberpunk — neon, futuristic', value: 'cyberpunk' },
      { name: 'Coffeecup — warm, earthy tones', value: 'coffeecup' },
      { name: 'Silk — soft, pastel elegance', value: 'silk' },
      { name: 'Custom — define your own brand color', value: 'custom' },
    ],
  },
  {
    type: 'input',
    name: 'brandHex',
    message: 'Primary brand color (hex, e.g. #16a34a):',
    default: '#16a34a',
    when: (answers: Record<string, unknown>) => answers.theme === 'custom',
    validate: (input: string) =>
      validateHex(input) || 'Enter valid hex color like #16a34a or #fff',
  },
  {
    type: 'confirm',
    name: 'overrideComponent',
    message: 'Override a component?',
    default: false,
  },
  {
    type: 'input',
    name: 'overrideComponentName',
    message: 'Component name (PascalCase, e.g. ProductCard):',
    when: (answers: Record<string, unknown>) =>
      answers.overrideComponent === true,
    validate: (input: string) =>
      (input && input.length > 0 && /^[A-Z]/.test(input)) ||
      'Enter PascalCase component name',
  },
  {
    type: 'confirm',
    name: 'registerMsw',
    message: 'Register MSW mocked data for this tenant?',
    default: true,
  },
  ]

  // Conditional on ctx, not per-question `when` — pinion routes `when` to
  // inquirer, which only sees prompt answers, never ctx.framework.
  const appShellPrompt: DistinctQuestion = {
    type: 'confirm',
    name: 'appShell',
    message: 'Does the tenant own its app shell? (different nav menu / routes)',
    default: false,
  }

  return ctx.framework === 'angular' ? [...prompts, appShellPrompt] : prompts
}

export { tenantPrompts }

