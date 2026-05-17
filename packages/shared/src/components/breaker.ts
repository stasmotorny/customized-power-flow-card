import { type CardMainContext, type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { customPowerNodeElement, type CustomPowerNode } from "./custom-power-node";

export const breakerElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  breaker: CustomPowerNode
) => customPowerNodeElement(main, config, breaker, "grid", "grid-icon");
