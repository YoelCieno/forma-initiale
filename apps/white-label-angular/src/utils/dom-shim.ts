type ElInternalsFallback = {
  shadowRoot: null
  form: null
  labels: unknown[]
  states: { add(): void; delete(): void; has(): boolean }
  validationMessage: string
  validity: { valid: boolean }
  willValidate: boolean
  checkValidity(): boolean
  reportValidity(): boolean
  setFormValue(): void
  setValidity(): void
} extends ElementInternals ? ElementInternals : unknown;

export const createFallbackInternals = <T extends ElInternalsFallback>(): T => {
  return {
    shadowRoot: null,
    form: null,
    labels: [],
    states: { add: () => {}, delete: () => {}, has: () => false },
    validationMessage: '',
    validity: { valid: true },
    willValidate: false,
    checkValidity: () => true,
    reportValidity: () => true,
    setFormValue: () => {},
    setValidity: () => {},
  } as T
}
