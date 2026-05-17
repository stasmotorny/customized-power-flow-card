import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { type Flows } from "./index";

type FlowBreakerToDirectLoadsFlows = Pick<Flows, "grid" | "newDur">;

const breakerToDirectLoadsDot = (
  config: FlowCardPlusConfig,
  grid: FlowBreakerToDirectLoadsFlows["grid"],
  newDur: FlowBreakerToDirectLoadsFlows["newDur"]
) => {
  if (!checkShouldShowDots(config) || !grid.state.toHome) return nothing;

  return svg`
    <circle r="1" class="grid" vector-effect="non-scaling-stroke">
      <animateMotion dur="${newDur.gridToHome}s" repeatCount="indefinite" calcMode="paced">
        <mpath xlink:href="#breaker-direct-loads" />
      </animateMotion>
    </circle>
  `;
};

export const flowBreakerToDirectLoads = (
  config: FlowCardPlusConfig,
  { grid, newDur }: FlowBreakerToDirectLoadsFlows
) => {
  const shouldShow = grid.has && showLine(config, grid.state.fromGrid);

  if (!shouldShow) return nothing;

  const value = grid.state.toHome || 0;

  return html`
    <div class="lines high">
      <svg
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        id="breaker-direct-loads-flow"
      >
        <path
          id="breaker-direct-loads"
          class="grid ${styleLine(value, config)}"
          d="M33.33,50 V0"
          vector-effect="non-scaling-stroke"
        ></path>

        ${breakerToDirectLoadsDot(config, grid, newDur)}
      </svg>
    </div>
  `;
};
