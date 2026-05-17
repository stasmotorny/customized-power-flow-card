import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { CUSTOM_TOPOLOGY_VIEW_BOX, customTopologyPath } from "./custom-topology-geometry";
import { type Flows } from "./index";

type FlowBatteryToInverterFlows = Pick<Flows, "battery" | "newDur">;

const batteryToInverterDot = (
  config: FlowCardPlusConfig,
  battery: FlowBatteryToInverterFlows["battery"],
  newDur: FlowBatteryToInverterFlows["newDur"]
) => {
  if (!checkShouldShowDots(config) || !battery.state.toHome) return nothing;

  return svg`
    <circle r="1" class="battery-home" vector-effect="non-scaling-stroke">
      <animateMotion dur="${newDur.batteryToHome}s" repeatCount="indefinite" calcMode="paced">
        <mpath xlink:href="#battery-inverter" />
      </animateMotion>
    </circle>
  `;
};

export const flowBatteryToInverter = (
  config: FlowCardPlusConfig,
  { battery, newDur }: FlowBatteryToInverterFlows
) => {
  const shouldShow =
    battery.has && showLine(config, battery.state.toHome) && !config.entities.home?.hide;

  if (!shouldShow) return nothing;

  return html`
    <div class="lines custom-topology-lines">
      <svg
        viewBox=${CUSTOM_TOPOLOGY_VIEW_BOX}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        id="battery-inverter-flow"
      >
        <path
          id="battery-inverter"
          class="battery-home ${styleLine(battery.state.toHome || 0, config)}"
          d=${customTopologyPath("battery", "inverter")}
          vector-effect="non-scaling-stroke"
        ></path>

        ${batteryToInverterDot(config, battery, newDur)}
      </svg>
    </div>
  `;
};
