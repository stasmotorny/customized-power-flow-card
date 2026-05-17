import { type CardMainContext, type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { customPowerNodeElement, type CustomPowerNode } from "./custom-power-node";

export const inverterElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  inverter: CustomPowerNode
) => customPowerNodeElement(main, config, inverter, "battery");
