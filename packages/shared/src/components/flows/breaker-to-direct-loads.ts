import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing } from "lit";
import { customTopologyDot } from "./custom-topology-dot";
import { CUSTOM_TOPOLOGY_VIEW_BOX, customTopologyPath } from "./custom-topology-geometry";
import { type Flows } from "./index";

type FlowBreakerToDirectLoadsFlows = Pick<Flows, "customTopologyFlows" | "directLoads" | "newDur">;

export const flowBreakerToDirectLoads = (
  config: FlowCardPlusConfig,
  { customTopologyFlows, directLoads, newDur }: FlowBreakerToDirectLoadsFlows
) => {
  const value = customTopologyFlows?.breakerToDirectLoads ?? directLoads?.state ?? 0;
  const shouldShow = (directLoads?.has || value > 0) && showLine(config, value);

  if (!shouldShow) return nothing;

  return html`
    <div class="lines custom-topology-lines">
      <svg
        viewBox=${CUSTOM_TOPOLOGY_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        id="breaker-direct-loads-flow"
      >
        <path
          id="breaker-direct-loads"
          class="grid ${styleLine(value, config)}"
          d=${customTopologyPath("breaker", "directLoads")}
          vector-effect="non-scaling-stroke"
        ></path>

        ${checkShouldShowDots(config) && value > 0
          ? customTopologyDot({
              className: "grid",
              duration: newDur.directLoads,
              pathId: "breaker-direct-loads",
            })
          : nothing}
      </svg>
    </div>
  `;
};
