import { describe, expect, test } from "vitest";

import { flowElement } from "../src/components/flows";
import { customTopologyDot } from "../src/components/flows/custom-topology-dot";
import {
  CUSTOM_TOPOLOGY_NODE_CENTERS,
  CUSTOM_TOPOLOGY_VIEW_BOX,
  customTopologyIndividualKeyPoints,
  customTopologyPath,
} from "../src/components/flows/custom-topology-geometry";
import { individualRightBottomElement } from "../src/components/individual-right-bottom-element";
import { individualRightTopElement } from "../src/components/individual-right-top-element";
import { styles } from "../src/style";
import { type FlowCardPlusConfig } from "../src/types";
import { computeCustomTopologyPowerFlows } from "../src/utils/compute-custom-topology-power-flows";

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

const animatedConfig = {
  ...config,
  disable_dots: false,
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
    gridToBreaker: 1,
    breakerToInverter: 1,
    inverterToHome: 1,
    batteryToInverter: 1,
    inverterToBattery: 1,
  },
};

const expectRenderedFlows = (markup: string, expectedIds: string[], unexpectedIds: string[]) => {
  for (const id of expectedIds) expect(markup).toContain(`id="${id}"`);
  for (const id of unexpectedIds) expect(markup).not.toContain(`id="${id}"`);
};

const customTopologyFlowPathExpectations = [
  ["grid", "breaker", "grid", "breaker"],
  ["breaker", "inverter", "breaker", "inverter"],
  ["inverter", "home", "inverter", "home"],
  ["breaker", "directLoads", "breaker", "directLoads"],
  ["battery", "inverter", "battery", "inverter"],
  ["solar", "home", "solar", "home"],
  ["solar", "grid", "solar", "grid"],
  ["solar", "battery", "solar", "battery"],
] as const;

const main = {
  hass: {},
  onEntityClick: () => undefined,
  onEntityDoubleClick: () => undefined,
  onEntityPointerDown: () => undefined,
  onEntityPointerUp: () => undefined,
  openDetails: () => undefined,
} as any;

const individualConfig = {
  ...config,
  entities: {
    home: {},
    individual: [{ entity: "light.test" }],
  },
  disable_dots: false,
} as unknown as FlowCardPlusConfig;

const individualObj = {
  has: true,
  entity: "light.test",
  field: { entity: "light.test" },
  name: "Light",
  icon: "mdi:lightbulb",
  state: 100,
  displayZeroTolerance: 0,
  invertAnimation: false,
} as any;

const individualNewDur = {
  ...baseFlows.newDur,
  individual: [1],
  nonFossil: 1,
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

  test("computes balanced custom topology power flows", () => {
    const derived = computeCustomTopologyPowerFlows({
      breakerInput: 221,
      inverterInput: 9,
      directLoadsInput: null,
    });

    expect(derived.breakerToInverter).toBe(9);
    expect(derived.breakerToDirectLoads).toBe(212);
    expect(derived.gridToBreaker).toBe(221);
    expect(derived.gridToBreaker).toBe(derived.breakerToInverter + derived.breakerToDirectLoads);

    const explicitBranchesWin = computeCustomTopologyPowerFlows({
      breakerInput: 221,
      inverterInput: 9,
      directLoadsInput: 30,
    });

    expect(explicitBranchesWin.breakerToDirectLoads).toBe(30);
    expect(explicitBranchesWin.gridToBreaker).toBe(39);
    expect(explicitBranchesWin.gridToBreaker).toBe(
      explicitBranchesWin.breakerToInverter + explicitBranchesWin.breakerToDirectLoads
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
    expect(markup).toContain('d="M12.5,170 H37.5"');
    expect(markup).toContain('d="M37.5,170 H62.5"');
    expect(markup).toContain('d="M62.5,170 H87.5"');
    expect(markup).toContain("d=M37.5,170 V40");
    expect(markup).toContain("d=M62.5,280 V170");
    expect(markup).toContain('d="M62.5,60 V170 H87.5"');
    expect(markup).toContain('d="M62.5,60 V170 H12.5"');
    expect(markup).toContain('d="M62.5,60 V280"');
  });

  test("animates each active custom topology path from its own flow value", () => {
    const markup = templateToString(
      flowElement(animatedConfig, {
        ...baseFlows,
        customTopologyHas: true,
        customTopologyFlows: {
          gridToBreaker: 221,
          breakerToInverter: 9,
          breakerToDirectLoads: 212,
          inverterToHome: 9,
          batteryToInverter: 0,
          inverterToBattery: 0,
        },
      })
    );

    expect(markup).toContain('id="grid-breaker"');
    expect(markup).toContain('xlink:href="#grid-breaker"');
    expect(markup).toContain('dur="1s"');
    expect(markup).toContain('id="breaker-inverter"');
    expect(markup).toContain('xlink:href="#breaker-inverter"');
    expect(markup).toContain('id="breaker-direct-loads"');
    expect(markup).toContain('xlink:href="#breaker-direct-loads"');
    expect(markup).toContain('id="inverter-home"');
    expect(markup).toContain('xlink:href="#inverter-home"');
    expect(markup).toContain("<ellipse");
    expect(markup).toContain('class="grid custom-topology-dot"');
  });

  test("custom topology dot rendering uses compensated ellipses instead of distorted circles", () => {
    const dot = templateToString(
      customTopologyDot({ className: "grid", duration: 2, pathId: "grid-breaker" })
    );

    expect(dot).toContain("<ellipse");
    expect(dot).toContain('rx="0.6"');
    expect(dot).toContain('ry="3"');
    expect(dot).not.toContain("<circle");
  });

  test("builds every custom topology path from shared node-center geometry", () => {
    const markup = templateToString(
      flowElement(config, {
        ...baseFlows,
        customTopologyHas: true,
      })
    );

    for (const [
      pathSource,
      pathTarget,
      centerSource,
      centerTarget,
    ] of customTopologyFlowPathExpectations) {
      expect(markup).toContain(customTopologyPath(pathSource, pathTarget));
      expect(CUSTOM_TOPOLOGY_NODE_CENTERS[pathSource]).toEqual(
        CUSTOM_TOPOLOGY_NODE_CENTERS[centerSource]
      );
      expect(CUSTOM_TOPOLOGY_NODE_CENTERS[pathTarget]).toEqual(
        CUSTOM_TOPOLOGY_NODE_CENTERS[centerTarget]
      );
    }
  });

  test("custom individual paths use home-to-device node centers and positive flow animates outward", () => {
    const rightTopMarkup = templateToString(
      individualRightTopElement(main, individualConfig, {
        individualObj,
        displayState: "100 W",
        newDur: individualNewDur,
        templatesObj: { individual: [] },
        battery: baseFlows.battery,
        individualObjs: [individualObj],
        customTopologyHas: true,
      })
    );
    const rightBottomMarkup = templateToString(
      individualRightBottomElement(main, individualConfig, {
        individualObj,
        displayState: "100 W",
        newDur: individualNewDur,
        templatesObj: { individual: [] },
        customTopologyHas: true,
      })
    );

    expect(rightTopMarkup).toContain(`d=${customTopologyPath("home", "rightTopIndividual")}`);
    expect(rightBottomMarkup).toContain(`d=${customTopologyPath("home", "rightBottomIndividual")}`);
    expect(rightTopMarkup).toContain(`keyPoints="${customTopologyIndividualKeyPoints(false)}"`);
    expect(rightBottomMarkup).toContain(`keyPoints="${customTopologyIndividualKeyPoints(false)}"`);
    expect(customTopologyIndividualKeyPoints(true)).toBe("1;0");
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
    expect(cssText).toContain(".circle-container.battery.inverter");
    expect(cssText).toContain("height: auto");
    expect(cssText).toContain("justify-content: flex-start");
    expect(cssText).toContain(".row.custom-topology-layout .circle");
    expect(cssText).toContain("--ha-card-background");
    expect(cssText).toContain("z-index: 1");
    expect(cssText).toContain(".lines.custom-topology-lines");
    expect(cssText).toContain("z-index: 0");
  });
});
