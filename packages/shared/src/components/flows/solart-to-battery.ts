import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import {
  checkHasBottomIndividual,
  checkHasRightIndividual,
} from "@flixlix-cards/shared/utils/compute-individual-position";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { classMap } from "lit/directives/class-map.js";
import { CUSTOM_TOPOLOGY_VIEW_BOX, customTopologyPath } from "./custom-topology-geometry";
import { type Flows } from "./index";

const solarToBatteryDot = (
  config: FlowCardPlusConfig,
  solar: Flows["solar"],
  newDur: Flows["newDur"]
) => {
  if (!checkShouldShowDots(config) || !solar.state.toBattery) return nothing;

  return svg`<circle r="1" class="battery-solar" vector-effect="non-scaling-stroke">
      <animateMotion dur="${newDur.solarToBattery}s" repeatCount="indefinite" calcMode="paced">
        <mpath xlink:href="#battery-solar" />
      </animateMotion>
    </circle>`;
};

type FlowSolarToBatteryFlows = Pick<Flows, Exclude<keyof Flows, "grid">>;

export const flowSolarToBattery = (
  config: FlowCardPlusConfig,
  { battery, individual, solar, customTopologyHas, newDur }: FlowSolarToBatteryFlows
) => {
  const shouldShow = battery.has && solar.has && showLine(config, solar.state.toBattery || 0);
  if (!shouldShow) return nothing;

  const path = customTopologyHas ? customTopologyPath("solar", "battery") : "M50,0 V100";

  return html`<div
    class="lines ${classMap({
      "custom-topology-lines": !!customTopologyHas,
      high: battery.has || checkHasBottomIndividual(individual),
      "individual1-individual2": !battery.has && individual.every((i) => i?.has),
      "multi-individual": checkHasRightIndividual(individual),
    })}"
  >
    <svg
      viewBox=${customTopologyHas ? CUSTOM_TOPOLOGY_VIEW_BOX : "0 0 100 100"}
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio=${customTopologyHas ? "none" : "xMidYMid slice"}
      id="solar-battery-flow"
      class="flat-line"
    >
      <path
        id="battery-solar"
        class="battery-solar ${styleLine(solar.state.toBattery || 0, config)}"
        d="${path}"
        vector-effect="non-scaling-stroke"
      ></path>
      ${solarToBatteryDot(config, solar, newDur)}
    </svg>
  </div>`;
};
