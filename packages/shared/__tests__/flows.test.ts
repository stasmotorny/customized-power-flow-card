import { describe, expect, test } from "vitest";

import { flowElement } from "../src/components/flows";
import { type FlowCardPlusConfig } from "../src/types";

type LitTemplateResult = {
  strings?: readonly string[];
  values?: readonly unknown[];
};

const templateToString = (value: unknown): string => {
  if (value === undefined || value === null) return "";
  if (Array.isArray(value)) return value.map(templateToString).join("");
  if (typeof value !== "object") return String(value);

  const template = value as LitTemplateResult;
  if (!template.strings || !template.values) return "";

  return template.strings.reduce((result, part, index) => {
    return `${result}${part}${templateToString(template.values?.[index])}`;
  }, "");
};

const config = {
  entities: {
    home: {},
  },
  display_zero_lines: {
    mode: "hide",
  },
  disable_dots: true,
} as unknown as FlowCardPlusConfig;

const baseFlows = {
  battery: {
    has: true,
    state: {
      toGrid: 50,
      toHome: 100,
    },
  },
  grid: {
    has: true,
    hasReturnToGrid: true,
    state: {
      fromGrid: 200,
      toBattery: 75,
      toHome: 200,
    },
  },
  individual: [],
  solar: {
    has: true,
    state: {
      toBattery: 25,
      toGrid: 50,
      toHome: 150,
    },
  },
  directLoads: {
    has: true,
    state: 80,
  },
  newDur: {
    batteryGrid: 1,
    batteryToHome: 1,
    directLoads: 1,
    gridToHome: 1,
    solarToBattery: 1,
    solarToGrid: 1,
    solarToHome: 1,
  },
};

const expectRenderedFlows = (markup: string, expectedIds: string[], unexpectedIds: string[]) => {
  for (const id of expectedIds) expect(markup).toContain(`id="${id}"`);
  for (const id of unexpectedIds) expect(markup).not.toContain(`id="${id}"`);
};

describe("flowElement", () => {
  test("renders standard flows when custom topology is not configured", () => {
    const markup = templateToString(
      flowElement(config, {
        ...baseFlows,
        customTopologyHas: false,
      })
    );

    expectRenderedFlows(
      markup,
      [
        "solar-home-flow",
        "solar-grid-flow",
        "solar-battery-flow",
        "grid-home-flow",
        "battery-home-flow",
        "battery-grid-flow",
      ],
      ["grid-via-breaker-inverter-flow", "battery-inverter-flow", "breaker-direct-loads-flow"]
    );
  });

  test("renders custom topology flows instead of standard grid and battery home flows", () => {
    const markup = templateToString(
      flowElement(config, {
        ...baseFlows,
        customTopologyHas: true,
      })
    );

    expectRenderedFlows(
      markup,
      [
        "solar-home-flow",
        "solar-grid-flow",
        "solar-battery-flow",
        "grid-via-breaker-inverter-flow",
        "battery-inverter-flow",
        "breaker-direct-loads-flow",
      ],
      ["grid-home-flow", "battery-home-flow", "battery-grid-flow"]
    );
  });
});
