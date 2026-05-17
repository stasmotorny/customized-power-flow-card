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
    "sensor.solar": { state: "50", attributes: { unit_of_measurement: "W" } },
    "sensor.battery": { state: "20", attributes: { unit_of_measurement: "W" } },
    "sensor.breaker": { state: "100", attributes: { unit_of_measurement: "W" } },
    "sensor.inverter": { state: "70", attributes: { unit_of_measurement: "W" } },
    "sensor.direct_loads": { state: "30", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_1": { state: "10", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_2": { state: "20", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_3": { state: "30", attributes: { unit_of_measurement: "W" } },
    "sensor.individual_4": { state: "40", attributes: { unit_of_measurement: "W" } },
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
  test("routes custom topology bottom-right individual flow inline instead of absolute standard geometry", () => {
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
    expect(markup).toContain('id="individual-bottom-right-home"');
    expect(markup).toContain('d="M40 40 v-40"');
    expect(markup).not.toContain('class="right-individual-flow-container"');
    expect(markup).not.toContain('d="M45,100 v-15 c0,-30 -10,-30 -30,-30 h-20"');
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
