import { type IndividualObject } from "@flixlix-cards/shared/states/raw/individual/get-individual-object";
import { type FlowCardPlusConfig, type NewDur } from "@flixlix-cards/shared/types";
import { type CustomTopologyPowerFlows } from "@flixlix-cards/shared/utils/compute-custom-topology-power-flows";
import { html } from "lit";
import { flowBatteryToGrid } from "./battery-to-grid";
import { flowBatteryToHome } from "./battery-to-home";
import { customTopologyFlowOverlay } from "./custom-topology-flow-overlay";
import { flowGridToHome } from "./grid-to-home";
import { flowSolarToGrid } from "./solar-to-grid";
import { flowSolarToHome } from "./solar-to-home";
import { flowSolarToBattery } from "./solart-to-battery";

export interface Flows {
  battery: any;
  grid: any;
  individual: IndividualObject[];
  solar: any;
  directLoads?: any;
  customTopologyHas?: boolean;
  customTopologyFlows?: CustomTopologyPowerFlows;
  newDur: NewDur;
}

export const flowElement = (
  config: FlowCardPlusConfig,
  {
    battery,
    grid,
    individual,
    solar,
    directLoads,
    customTopologyHas,
    customTopologyFlows,
    newDur,
  }: Flows
) => {
  if (customTopologyHas) {
    return customTopologyFlowOverlay(config, {
      battery,
      customTopologyFlows,
      directLoads,
      grid,
      individual,
      newDur,
      solar,
    });
  }

  const solarFlows = html`
    ${flowSolarToHome(config, { battery, grid, individual, solar, customTopologyHas, newDur })}
    ${flowSolarToGrid(config, { battery, grid, individual, solar, customTopologyHas, newDur })}
    ${flowSolarToBattery(config, { battery, individual, solar, customTopologyHas, newDur })}
  `;

  return html`
    ${solarFlows} ${flowGridToHome(config, { battery, grid, individual, solar, newDur })}
    ${flowBatteryToHome(config, { battery, grid, individual, newDur })}
    ${flowBatteryToGrid(config, { battery, grid, individual, newDur })}
  `;
};
