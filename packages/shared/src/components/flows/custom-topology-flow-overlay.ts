import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { checkShouldShowDots } from "@flixlix-cards/shared/utils/check-should-show-dots";
import { computeIndividualFlowRate } from "@flixlix-cards/shared/utils/compute-flow-rate";
import {
  getBottomRightIndividual,
  getTopRightIndividual,
} from "@flixlix-cards/shared/utils/compute-individual-position";
import { showLine } from "@flixlix-cards/shared/utils/show-line";
import { styleLine } from "@flixlix-cards/shared/utils/style-line";
import { html, nothing, svg } from "lit";
import { customTopologyDot } from "./custom-topology-dot";
import { CUSTOM_TOPOLOGY_VIEW_BOX, customTopologyPath } from "./custom-topology-geometry";
import { type Flows } from "./index";

type CustomTopologyFlowOverlayFlows = Pick<
  Flows,
  "battery" | "customTopologyFlows" | "directLoads" | "grid" | "individual" | "newDur" | "solar"
>;

type CustomTopologyPathOptions = {
  className: string;
  duration?: number;
  invertAnimation?: boolean;
  path: string;
  pathId: string;
  value: number;
};

const customTopologyFlowPath = (
  config: FlowCardPlusConfig,
  { className, duration, invertAnimation, path, pathId, value }: CustomTopologyPathOptions
) => {
  if (!showLine(config, value)) return nothing;

  return svg`
    <path
      id="${pathId}"
      class="${`${className} ${styleLine(value, config)}`}"
      d="${path}"
      vector-effect="non-scaling-stroke"
    ></path>
    ${checkShouldShowDots(config) && value > 0
      ? customTopologyDot({ className, duration, invertAnimation, pathId })
      : nothing}
  `;
};

/**
 * Renders every custom-topology flow in one card-level SVG. Keeping all paths
 * in a single shared viewBox prevents sibling overlay stacking/clipping from
 * hiding the horizontal Grid → Breaker → Inverter → Home branch or individual
 * child-load particles independently of the other custom topology paths.
 */
export const customTopologyFlowOverlay = (
  config: FlowCardPlusConfig,
  {
    battery,
    customTopologyFlows,
    directLoads,
    grid,
    individual,
    newDur,
    solar,
  }: CustomTopologyFlowOverlayFlows
) => {
  const flows = customTopologyFlows ?? {
    gridToBreaker: grid.state.toHome || 0,
    breakerToInverter: grid.state.toHome || 0,
    breakerToDirectLoads: directLoads?.state ?? 0,
    inverterToHome: grid.state.toHome || 0,
    batteryToInverter: battery.state.toHome ?? 0,
    inverterToBattery: 0,
  };
  const homeVisible = !config.entities.home?.hide;
  const batteryToInverter = flows.batteryToInverter;
  const inverterToBattery = flows.inverterToBattery;
  const batteryInverterValue = Math.max(batteryToInverter, inverterToBattery);
  const batteryInverterInverted = inverterToBattery > batteryToInverter;
  const topRightIndividual = getTopRightIndividual(individual);
  const bottomRightIndividual = getBottomRightIndividual(individual);
  const topRightIndex = topRightIndividual
    ? config.entities.individual?.findIndex((entity) => entity.entity === topRightIndividual.entity)
    : -1;
  const bottomRightIndex = bottomRightIndividual
    ? config.entities.individual?.findIndex(
        (entity) => entity.entity === bottomRightIndividual.entity
      )
    : -1;
  const topRightDuration =
    topRightIndex === undefined || topRightIndex < 0
      ? undefined
      : newDur.individual?.[topRightIndex];
  const bottomRightDuration =
    bottomRightIndex === undefined || bottomRightIndex < 0
      ? undefined
      : newDur.individual?.[bottomRightIndex];

  const overlay = svg`
    <svg
      viewBox="${CUSTOM_TOPOLOGY_VIEW_BOX}"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      id="custom-topology-flow-overlay"
      aria-hidden="true"
    >
      ${grid.has && homeVisible
        ? svg`
            ${customTopologyFlowPath(config, {
              className: "grid",
              duration: newDur.gridToBreaker,
              path: customTopologyPath("grid", "breaker"),
              pathId: "grid-breaker",
              value: flows.gridToBreaker,
            })}
            ${customTopologyFlowPath(config, {
              className: "grid",
              duration: newDur.breakerToInverter,
              path: customTopologyPath("breaker", "inverter"),
              pathId: "breaker-inverter",
              value: flows.breakerToInverter,
            })}
            ${customTopologyFlowPath(config, {
              className: "grid",
              duration: newDur.inverterToHome,
              path: customTopologyPath("inverter", "home"),
              pathId: "inverter-home",
              value: flows.inverterToHome,
            })}
          `
        : nothing}
      ${(directLoads?.has || flows.breakerToDirectLoads > 0) && homeVisible
        ? customTopologyFlowPath(config, {
            className: "grid",
            duration: newDur.directLoads,
            path: customTopologyPath("breaker", "directLoads"),
            pathId: "breaker-direct-loads",
            value: flows.breakerToDirectLoads,
          })
        : nothing}
      ${battery.has && homeVisible
        ? customTopologyFlowPath(config, {
            className: "battery-home",
            duration: batteryInverterInverted ? newDur.inverterToBattery : newDur.batteryToInverter,
            invertAnimation: batteryInverterInverted,
            path: customTopologyPath("battery", "inverter"),
            pathId: "battery-inverter",
            value: batteryInverterValue,
          })
        : nothing}
      ${solar.has && homeVisible
        ? customTopologyFlowPath(config, {
            className: "solar",
            duration: newDur.solarToHome,
            path: customTopologyPath("solar", "home"),
            pathId: "solar",
            value: solar.state.toHome || 0,
          })
        : nothing}
      ${grid.has && grid.hasReturnToGrid && solar.has
        ? customTopologyFlowPath(config, {
            className: "return",
            duration: newDur.solarToGrid,
            path: customTopologyPath("solar", "grid"),
            pathId: "return",
            value: solar.state.toGrid || 0,
          })
        : nothing}
      ${battery.has && solar.has
        ? customTopologyFlowPath(config, {
            className: "solar",
            duration: newDur.solarToBattery,
            path: customTopologyPath("solar", "battery"),
            pathId: "solar-battery",
            value: solar.state.toBattery || 0,
          })
        : nothing}
      ${topRightIndividual && homeVisible
        ? customTopologyFlowPath(config, {
            className: "individual-top individual-right-top",
            duration: computeIndividualFlowRate(
              topRightIndividual.field?.calculate_flow_rate,
              topRightDuration || 1.66
            ),
            invertAnimation: topRightIndividual.invertAnimation,
            path: customTopologyPath("home", "rightTopIndividual"),
            pathId: "individual-top-right-home",
            value: topRightIndividual.state || 0,
          })
        : nothing}
      ${bottomRightIndividual && homeVisible
        ? customTopologyFlowPath(config, {
            className: "individual-bottom individual-right-bottom",
            duration: computeIndividualFlowRate(
              bottomRightIndividual.field?.calculate_flow_rate,
              bottomRightDuration || 1.66
            ),
            invertAnimation: bottomRightIndividual.invertAnimation,
            path: customTopologyPath("home", "rightBottomIndividual"),
            pathId: "individual-bottom-right-home",
            value: bottomRightIndividual.state || 0,
          })
        : nothing}
    </svg>
  `;

  return html`<div class="lines custom-topology-lines">${overlay}</div>`;
};
