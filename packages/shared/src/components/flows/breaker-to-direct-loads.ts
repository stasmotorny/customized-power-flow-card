import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { type Flows } from "./index";

type FlowBreakerToDirectLoadsFlows = Pick<Flows, "directLoads" | "newDur">;

const breakerToDirectLoadsDot = (
  config: FlowCardPlusConfig,
  directLoads: FlowBreakerToDirectLoadsFlows["directLoads"],
  newDur: FlowBreakerToDirectLoadsFlows["newDur"]
) => {
  if (!checkShouldShowDots(config) || !directLoads.state) return nothing;

  return svg`
    <circle r="1" class="grid" vector-effect="non-scaling-stroke">
      <animateMotion dur="${newDur.directLoads}s" repeatCount="indefinite" calcMode="paced">
        <mpath xlink:href="#breaker-direct-loads" />
      </animateMotion>
    </circle>
  `;
};

export const flowBreakerToDirectLoads = (
  config: FlowCardPlusConfig,
  { directLoads, newDur }: FlowBreakerToDirectLoadsFlows
) => {
  const shouldShow = directLoads?.has && showLine(config, directLoads.state);

  if (!shouldShow) return nothing;

  const value = directLoads.state || 0;

  return html`
    <div class="lines custom-topology-lines">
      <svg
        viewBox="0 0 320 300"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        id="breaker-direct-loads-flow"
      >
        <path
          id="breaker-direct-loads"
          class="grid ${styleLine(value, config)}"
          d="M120,170 V40"
          vector-effect="non-scaling-stroke"
        ></path>

        ${breakerToDirectLoadsDot(config, directLoads, newDur)}
      </svg>
    </div>
  `;
};
