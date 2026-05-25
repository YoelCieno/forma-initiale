import { vi } from "vitest";
import { config } from "@vue/test-utils";

config.global.config.compilerOptions = {
  isCustomElement: (tag: string) => tag.startsWith("wa-") || tag.startsWith("fe-"),
};

// Mock @repo/ui/fe-button to prevent Lit web component registration.
// Lit component defines properties on the element prototype via @property() decorators.
// Vue's patchProp checks `key in el` — if true, uses property assignment instead of setAttribute.
// Property assignment bypasses Lit's attribute reflection, so `getAttribute()` returns null/null.
// Mocking prevents custom element registration, so `key in el` returns false for wa-* attrs,
// and Vue falls back to setAttribute — which is what tests check via `wrapper.attributes()`.
// Vue's `isCustomElement` config already handles <wa-button> rendering as custom element.
vi.mock("@repo/ui/fe-button", () => {
  return {};
});
