import { type CardMainContext, type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { customPowerNodeElement, type CustomPowerNode } from "./custom-power-node";

export const directLoadsElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  directLoads: CustomPowerNode
) => customPowerNodeElement(main, config, directLoads, "individual-top");
