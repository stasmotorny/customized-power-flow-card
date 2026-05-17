import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { type Flows } from "./index";

type FlowGridViaBreakerInverterFlows = Pick<Flows, "grid" | "newDur">;

const flowDot = (
  config: FlowCardPlusConfig,
  grid: FlowGridViaBreakerInverterFlows["grid"],
  newDur: FlowGridViaBreakerInverterFlows["newDur"],
  pathId: string
) => {
  if (!checkShouldShowDots(config) || !grid.state.toHome) return nothing;

  return svg`
    <circle r="1" class="grid" vector-effect="non-scaling-stroke">
      <animateMotion dur="${newDur.gridToHome}s" repeatCount="indefinite" calcMode="paced">
        <mpath xlink:href="#${pathId}" />
      </animateMotion>
    </circle>
  `;
};

export const flowGridViaBreakerInverter = (
  config: FlowCardPlusConfig,
  { grid, newDur }: FlowGridViaBreakerInverterFlows
) => {
  const shouldShow =
    grid.has && showLine(config, grid.state.fromGrid) && !config.entities.home?.hide;

  if (!shouldShow) return nothing;

  const value = grid.state.toHome || 0;

  return html`
    <div class="lines custom-topology-lines">
      <svg
        viewBox="0 0 320 300"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        id="grid-via-breaker-inverter-flow"
        class="flat-line"
      >
        <!-- Grid → Breaker -->
        <path
          id="grid-breaker"
          class="grid ${styleLine(value, config)}"
          d="M40,170 H120"
          vector-effect="non-scaling-stroke"
        ></path>
        ${flowDot(config, grid, newDur, "grid-breaker")}

        <!-- Breaker → Inverter -->
        <path
          id="breaker-inverter"
          class="grid ${styleLine(value, config)}"
          d="M120,170 H200"
          vector-effect="non-scaling-stroke"
        ></path>
        ${flowDot(config, grid, newDur, "breaker-inverter")}

        <!-- Inverter → Home -->
        <path
          id="inverter-home"
          class="grid ${styleLine(value, config)}"
          d="M200,170 H280"
          vector-effect="non-scaling-stroke"
        ></path>
        ${flowDot(config, grid, newDur, "inverter-home")}
      </svg>
    </div>
  `;
};
