import { vi } from "vitest";
import { config } from "@vue/test-utils";

config.global.config.compilerOptions = {
  isCustomElement: (tag: string) => tag.startsWith("fe-"),
};

vi.mock("@repo/ui/fe-card", () => {
  return {};
});

vi.mock("@repo/ui/fe-rating", () => {
  return {};
});
