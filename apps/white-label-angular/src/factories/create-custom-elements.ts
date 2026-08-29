import { CUSTOM_ELEMENTS_SCHEMA, ChangeDetectionStrategy, Component } from '@angular/core'

export const feComponent = (
  metadata: Parameters<typeof Component>[0],
): ReturnType<typeof Component> => {
  const inputSchemas = metadata.schemas ?? []
  const schemas = inputSchemas.includes(CUSTOM_ELEMENTS_SCHEMA)
    ? [...inputSchemas]
    : [...inputSchemas, CUSTOM_ELEMENTS_SCHEMA]
  const changeDetection = metadata.changeDetection ?? ChangeDetectionStrategy.OnPush

  return Component({
    ...metadata,
    schemas,
    changeDetection,
  })
}
