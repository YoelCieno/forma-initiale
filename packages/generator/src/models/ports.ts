/** Per-framework scan strategy — how to find tenant dirs and read their dev port. */
export interface PortScan {
  dirSuffix: string
  configFile: string
  extract: (content: string) => number | undefined
  /** Used when no tenant of the framework exists yet; overridable via `${FRAMEWORK}_FIRST_PORT`. */
  fallbackPort: number
}

/** Subset of angular.json read for serve ports. */
export interface AngularJson {
  projects?: Record<string, { architect?: { serve?: { options?: { port?: number } } } }>
}
