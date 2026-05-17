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
    <div class="lines high">
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        id="grid-via-breaker-inverter-flow"
        class="flat-line"
      >
        <!-- Grid → Breaker -->
        <path
          id="grid-breaker"
          class="grid ${styleLine(value, config)}"
          d="M0,50 H25"
          vector-effect="non-scaling-stroke"
        ></path>
        ${flowDot(config, grid, newDur, "grid-breaker")}

        <!-- Breaker → Inverter -->
        <path
          id="breaker-inverter"
          class="grid ${styleLine(value, config)}"
          d="M25,50 H55"
          vector-effect="non-scaling-stroke"
        ></path>
        ${flowDot(config, grid, newDur, "breaker-inverter")}

        <!-- Inverter → Home -->
        <path
          id="inverter-home"
          class="grid ${styleLine(value, config)}"
          d="M55,50 H100"
          vector-effect="non-scaling-stroke"
        ></path>
        ${flowDot(config, grid, newDur, "inverter-home")}
      </svg>
    </div>
  `;
};
