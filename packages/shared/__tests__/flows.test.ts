import { describe, expect, test } from "vitest";

import { flowElement } from "../src/components/flows";
import { CUSTOM_TOPOLOGY_VIEW_BOX } from "../src/components/flows/custom-topology-geometry";
import { styles } from "../src/style";
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

    expect(markup).toContain('class="lines custom-topology-lines"');
    expect(markup).toContain(`viewBox=${CUSTOM_TOPOLOGY_VIEW_BOX}`);
    expect(markup).not.toContain('viewBox="0 0 320 300"');
    expect(markup).toContain("d=M12.5,170 H37.5");
    expect(markup).toContain("d=M37.5,170 H62.5");
    expect(markup).toContain("d=M62.5,170 H87.5");
    expect(markup).toContain("d=M37.5,170 V40");
    expect(markup).toContain("d=M62.5,280 V170");
    expect(markup).toContain('d="M62.5,60 V170 H87.5"');
    expect(markup).toContain('d="M62.5,60 V170 H12.5"');
    expect(markup).toContain('d="M62.5,60 V280"');
  });

  test("keeps custom topology rows and SVG overlay in the same horizontal coordinate system", () => {
    const cssText = (styles as unknown as { cssText: string }).cssText;

    expect(cssText).toContain(".lines.custom-topology-lines");
    expect(cssText).toContain("width: 100%");
    expect(cssText).not.toContain(
      ".lines.custom-topology-lines {\n    top: 0;\n    bottom: auto;\n    left: 0;\n    width: calc(var(--size-circle-entity) * 4)"
    );
    expect(cssText).toContain("grid-template-columns: repeat(4, minmax(0, 1fr))");
    expect(cssText).toContain("justify-content: stretch");
    expect(cssText).toContain("justify-items: center");
  });
});
