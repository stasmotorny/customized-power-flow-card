import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing } from "lit";
import { customTopologyDot } from "./custom-topology-dot";
import { CUSTOM_TOPOLOGY_VIEW_BOX, customTopologyPath } from "./custom-topology-geometry";
import { type Flows } from "./index";

type FlowBatteryToInverterFlows = Pick<Flows, "battery" | "customTopologyFlows" | "newDur">;

export const flowBatteryToInverter = (
  config: FlowCardPlusConfig,
  { battery, customTopologyFlows, newDur }: FlowBatteryToInverterFlows
) => {
  const batteryToInverter = customTopologyFlows?.batteryToInverter ?? battery.state.toHome ?? 0;
  const inverterToBattery = customTopologyFlows?.inverterToBattery ?? 0;
  const value = Math.max(batteryToInverter, inverterToBattery);
  const invertAnimation = inverterToBattery > batteryToInverter;
  const shouldShow = battery.has && showLine(config, value) && !config.entities.home?.hide;

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
          class="battery-home ${styleLine(value, config)}"
          d=${customTopologyPath("battery", "inverter")}
          vector-effect="non-scaling-stroke"
        ></path>

        ${checkShouldShowDots(config) && value > 0
          ? customTopologyDot({
              className: "battery-home",
              duration: invertAnimation ? newDur.inverterToBattery : newDur.batteryToInverter,
              invertAnimation,
              pathId: "battery-inverter",
            })
          : nothing}
      </svg>
    </div>
  `;
};
