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

const solarToGridDot = (
  config: FlowCardPlusConfig,
  solar: Flows["solar"],
  newDur: Flows["newDur"]
) => {
  if (!checkShouldShowDots(config) || !solar.state.toGrid || !solar.has) return nothing;

  return svg`<circle r="1" class="return" vector-effect="non-scaling-stroke">
      <animateMotion dur="${newDur.solarToGrid}s" repeatCount="indefinite" calcMode="paced">
        <mpath xlink:href="#return" />
      </animateMotion>
    </circle>`;
};

export const flowSolarToGrid = (
  config: FlowCardPlusConfig,
  { battery, grid, individual, solar, customTopologyHas, newDur }: Flows
) => {
  const shouldShow =
    grid.has && grid.hasReturnToGrid && solar.has && showLine(config, solar.state.toGrid || 0);
  if (!shouldShow) return nothing;

  const path = customTopologyHas
    ? customTopologyPath("solar", "grid")
    : `M${battery.has ? 45 : 47},0 v15 c0,${
        battery.has ? "30 -10,30 -30,30" : "35 -10,35 -30,35"
      } h-20`;

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
      id="solar-grid-flow"
    >
      <path
        id="return"
        class="return ${styleLine(solar.state.toGrid || 0, config)}"
        d="${path}"
        vector-effect="non-scaling-stroke"
      ></path>
      ${solarToGridDot(config, solar, newDur)}
    </svg>
  </div>`;
};
