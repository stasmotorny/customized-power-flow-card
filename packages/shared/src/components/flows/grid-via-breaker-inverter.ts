import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing } from "lit";
import { customTopologyDot } from "./custom-topology-dot";
import { CUSTOM_TOPOLOGY_VIEW_BOX, customTopologyPath } from "./custom-topology-geometry";
import { type Flows } from "./index";

type FlowGridViaBreakerInverterFlows = Pick<Flows, "customTopologyFlows" | "grid" | "newDur">;

const customFlowPath = (
  config: FlowCardPlusConfig,
  pathId: string,
  className: string,
  path: string,
  value: number,
  duration: number | undefined
) => {
  if (!showLine(config, value)) return nothing;

  return html`
    <path
      id="${pathId}"
      class="${className} ${styleLine(value, config)}"
      d="${path}"
      vector-effect="non-scaling-stroke"
    ></path>
    ${checkShouldShowDots(config) && value > 0
      ? customTopologyDot({ className, duration, pathId })
      : nothing}
  `;
};

export const flowGridViaBreakerInverter = (
  config: FlowCardPlusConfig,
  { customTopologyFlows, grid, newDur }: FlowGridViaBreakerInverterFlows
) => {
  const flows = customTopologyFlows ?? {
    gridToBreaker: grid.state.toHome || 0,
    breakerToInverter: grid.state.toHome || 0,
    inverterToHome: grid.state.toHome || 0,
  };
  const shouldShow = grid.has && !config.entities.home?.hide;

  if (!shouldShow) return nothing;

  return html`
    <div class="lines custom-topology-lines">
      <svg
        viewBox=${CUSTOM_TOPOLOGY_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        id="grid-via-breaker-inverter-flow"
        class="flat-line"
      >
        <!-- Grid → Breaker -->
        ${customFlowPath(
          config,
          "grid-breaker",
          "grid",
          customTopologyPath("grid", "breaker"),
          flows.gridToBreaker,
          newDur.gridToBreaker
        )}

        <!-- Breaker → Inverter -->
        ${customFlowPath(
          config,
          "breaker-inverter",
          "grid",
          customTopologyPath("breaker", "inverter"),
          flows.breakerToInverter,
          newDur.breakerToInverter
        )}

        <!-- Inverter → Home -->
        ${customFlowPath(
          config,
          "inverter-home",
          "grid",
          customTopologyPath("inverter", "home"),
          flows.inverterToHome,
          newDur.inverterToHome
        )}
      </svg>
    </div>
  `;
};
