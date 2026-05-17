// test that the card renders correctly

import { describe, expect, test } from "vitest";

import { type PowerFlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { PowerFlowCardPlus } from "../src/power-flow-card-plus";

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

const hass = {
  localize: (key: string) => key,
  states: {
    "sensor.grid": { state: "100", attributes: { unit_of_measurement: "W" } },
    "sensor.grid_0": { state: "0", attributes: { unit_of_measurement: "W" } },
    "sensor.solar": { state: "50", attributes: { unit_of_measurement: "W" } },
    "sensor.battery": { state: "20", attributes: { unit_of_measurement: "W" } },
    "sensor.breaker": { state: "100", attributes: { unit_of_measurement: "W" } },
    "sensor.inverter": { state: "70", attributes: { unit_of_measurement: "W" } },
    "sensor.direct_loads": { state: "30", attributes: { unit_of_measurement: "W" } },
    "sensor.breaker_221": { state: "221", attributes: { unit_of_measurement: "W" } },
    "sensor.inverter_9": { state: "9", attributes: { unit_of_measurement: "W" } },
    "sensor.breaker_215": { state: "215", attributes: { unit_of_measurement: "W" } },
    "sensor.inverter_6": { state: "6", attributes: { unit_of_measurement: "W" } },
    "sensor.direct_loads_0": { state: "0", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_1": { state: "10", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_2": { state: "20", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_3": { state: "30", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_4": { state: "40", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_0": { state: "0", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_1w": { state: "1", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_74w": { state: "74", attributes: { unit_of_measurement: "W" } },
  },
  locale: {},
  config: {},
  user: { name: "test" },
  connection: {},
  callWS: async () => ({}),
} as any;

const renderCard = (config: PowerFlowCardPlusConfig): string => {
  const card = new PowerFlowCardPlus();
  card.hass = hass;
  card.setConfig(config);
  return templateToString((card as unknown as { render: () => unknown }).render());
};

const getMiddleRowMarkup = (markup: string, layoutClass: string): string => {
  const rows = markup.split(`<div class="row ${layoutClass}">`);
  return rows[2] ?? "";
};

describe("render", () => {
  (globalThis as any).ResizeObserver = class {
    observe() {}
    disconnect() {}
  };

  test("renders correctly", () => {
    const config = {
      type: "custom:power-flow-card-plus",
      entities: {
        grid: { entity: "sensor.grid" },
        solar: { entity: "sensor.solar" },
        battery: { entity: "sensor.battery" },
      },
    } as PowerFlowCardPlusConfig;
    const card = new PowerFlowCardPlus();
    card.hass = hass;
    card.setConfig(config);
    card.connectedCallback();
    const rendered = (card as unknown as { render: () => unknown }).render();
    expect(rendered).toBeTruthy();
  });

  test("uses the standard flex layout and original middle row structure without custom topology", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: { entity: "sensor.grid" },
        solar: { entity: "sensor.solar" },
        battery: { entity: "sensor.battery" },
      },
    } as PowerFlowCardPlusConfig);
    const middleRow = getMiddleRowMarkup(markup, "standard-layout");

    expect(markup).toContain('class="row standard-layout"');
    expect(markup).not.toContain('class="row custom-topology-layout"');
    expect(middleRow).toContain('class="circle-container grid"');
    expect(middleRow).toContain('id="home-circle"');
    expect(middleRow.match(/class="spacer"/g) ?? []).toHaveLength(1);
    expect(middleRow.match(/class="circle-container grid"/g) ?? []).toHaveLength(1);
  });

  test("uses the custom topology grid layout and middle row structure when configured", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: { entity: "sensor.grid" },
        solar: { entity: "sensor.solar" },
        battery: { entity: "sensor.battery" },
        breaker: { entity: "sensor.breaker" },
        inverter: { entity: "sensor.inverter" },
        direct_loads: { entity: "sensor.direct_loads" },
      },
    } as PowerFlowCardPlusConfig);
    const middleRow = getMiddleRowMarkup(markup, "custom-topology-layout");

    expect(markup).toContain('class="row custom-topology-layout"');
    expect(markup).not.toContain('class="row standard-layout"');
    expect(middleRow.match(/class="circle-container grid"/g) ?? []).toHaveLength(2);
    expect(middleRow).toContain('id="grid-icon"');
    expect(middleRow).toContain('class="circle-container battery inverter"');
    expect(middleRow).toContain('id="home-circle"');
    expect(middleRow.match(/class="spacer"/g) ?? []).toHaveLength(0);
  });
  test("derives custom topology direct loads and renders balanced node values", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: { entity: "sensor.grid" },
        solar: { entity: "sensor.solar" },
        battery: { entity: "sensor.battery" },
        breaker: { entity: "sensor.breaker_221" },
        inverter: { entity: "sensor.inverter_9" },
      },
    } as PowerFlowCardPlusConfig);

    expect(markup).toContain('class="row custom-topology-layout"');
    expect(markup).toContain("221 W");
    expect(markup).toContain("9 W");
    expect(markup).toContain("212 W");
    expect(markup).toContain('class="circle-container individual-top"');
  });

  test("keeps measured breaker and inverter states while deriving default direct loads", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: { entity: "sensor.grid" },
        breaker: { entity: "sensor.breaker_215" },
        inverter: { entity: "sensor.inverter_6" },
        direct_loads: { entity: "sensor.direct_loads_0" },
      },
    } as PowerFlowCardPlusConfig);

    expect(markup).toContain('class="row custom-topology-layout"');
    expect(markup).toContain("215 W");
    expect(markup).toContain("6 W");
    expect(markup).toContain("209 W");
    expect(markup).toContain('id="grid-breaker"');
    expect(markup).toContain('d="M12.5,170 H37.5"');
    expect(markup).toContain('id="breaker-inverter"');
    expect(markup).toContain('d="M37.5,170 H62.5"');
    expect(markup).toContain('id="inverter-home"');
    expect(markup).toContain('d="M62.5,170 H87.5"');
  });

  test("allows direct loads entity to be authoritative only when explicitly opted in", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      entities: {
        grid: { entity: "sensor.grid" },
        breaker: { entity: "sensor.breaker_215" },
        inverter: { entity: "sensor.inverter_6" },
        direct_loads: {
          entity: "sensor.direct_loads_0",
          use_entity_state_for_custom_topology: true,
        },
      },
    } as PowerFlowCardPlusConfig);

    expect(markup).toContain("215 W");
    expect(markup).toContain("6 W");
    expect(markup).not.toContain("209 W");
  });

  test("routes custom topology bottom-right individual flow through the shared custom overlay", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      allow_layout_break: true,
      entities: {
        grid: { entity: "sensor.grid" },
        solar: { entity: "sensor.solar" },
        battery: { entity: "sensor.battery" },
        breaker: { entity: "sensor.breaker" },
        inverter: { entity: "sensor.inverter" },
        direct_loads: { entity: "sensor.direct_loads" },
        individual: [
          { entity: "sensor.individual_1", name: "Individual 1" },
          { entity: "sensor.individual_2", name: "Individual 2" },
          { entity: "sensor.individual_3", name: "Individual 3" },
          { entity: "sensor.individual_4", name: "Сервер" },
        ],
      },
    } as PowerFlowCardPlusConfig);

    expect(markup).toContain('class="row custom-topology-layout"');
    expect(markup.match(/class="lines custom-topology-lines"/g) ?? []).toHaveLength(1);
    expect(markup).toContain('id="custom-topology-flow-overlay"');
    expect(markup).toContain('id="individual-top-right-home"');
    expect(markup).toContain('d="M87.5,170 V60"');
    expect(markup).toContain('xlink:href="#individual-top-right-home"');
    expect(markup).toContain('id="individual-bottom-right-home"');
    expect(markup).toContain("viewBox=0 0 100 300");
    expect(markup).toContain('d="M87.5,170 V280"');
    expect(markup).toContain('xlink:href="#individual-bottom-right-home"');
    expect(markup).not.toContain('id="individual-right-top-home-flow"');
    expect(markup).not.toContain('id="individual-right-bottom-home-flow"');
    expect(markup).not.toContain('d="M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20"');
  });

  test("keeps custom topology Home display at least as large as visible child loads", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      allow_layout_break: true,
      entities: {
        grid: { entity: "sensor.grid_0" },
        breaker: { entity: "sensor.breaker_221" },
        inverter: { entity: "sensor.inverter_9" },
        individual: [
          { entity: "sensor.individual_0", name: "Left 1", display_zero: true },
          { entity: "sensor.individual_0", name: "Left 2", display_zero: true },
          { entity: "sensor.individual_1w", name: "Св вітальня" },
          { entity: "sensor.individual_74w", name: "Холодильник" },
        ],
      },
    } as PowerFlowCardPlusConfig);

    expect(markup).toContain('id="individual-top-right-home"');
    expect(markup).toContain('id="individual-bottom-right-home"');
    expect(markup).toContain("1 W");
    expect(markup).toContain("74 W");
    expect(markup).toContain("75 W");
    expect(markup).not.toContain("<span>9 W</span>");
  });

  test("preserves standard bottom-right individual flow geometry without custom topology", () => {
    const markup = renderCard({
      type: "custom:power-flow-card-plus",
      allow_layout_break: true,
      entities: {
        grid: { entity: "sensor.grid" },
        solar: { entity: "sensor.solar" },
        battery: { entity: "sensor.battery" },
        individual: [
          { entity: "sensor.individual_1", name: "Individual 1" },
          { entity: "sensor.individual_2", name: "Individual 2" },
          { entity: "sensor.individual_3", name: "Individual 3" },
          { entity: "sensor.individual_4", name: "Сервер" },
        ],
      },
    } as PowerFlowCardPlusConfig);

    expect(markup).toContain('class="row standard-layout"');
    expect(markup).toContain('class="right-individual-flow-container"');
    expect(markup).toContain('id="individual-bottom-right-home"');
    expect(markup).toContain('d="M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20"');
  });
});
