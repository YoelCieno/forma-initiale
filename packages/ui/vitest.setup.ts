// Stub ElementInternals for WA components in jsdom
// jsdom 29 has attachInternals() but throws for non-custom elements
// WA catches the error, leaving this.internals undefined → crash on .validity.valid

function createInternalsStub(): ElementInternals {
  const internals = Object.create(ElementInternals.prototype)
  Object.defineProperty(internals, 'validity', {
    get: () => ({ valid: true, badInput: false, customError: false, patternMismatch: false, rangeOverflow: false, rangeUnderflow: false, stepMismatch: false, tooLong: false, tooShort: false, typeMismatch: false, valueMissing: false }),
    configurable: true,
  })
  internals.setValidity = () => {}
  internals.validationMessage = ''
  internals.states = new Set<string>()
  internals.willValidate = true
  return internals as ElementInternals
}

HTMLElement.prototype.attachInternals = function (): ElementInternals {
  return createInternalsStub()
}
