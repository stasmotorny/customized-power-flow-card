import { getEntityStateWatts } from "@flixlix-cards/shared/states/utils/get-entity-state-watts";
import { type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { type HomeAssistant } from "custom-card-helpers";

export const getBreakerState = (hass: HomeAssistant, config: FlowCardPlusConfig) =>
  getEntityStateWatts(hass, config.entities.breaker?.entity);

export const getInverterState = (hass: HomeAssistant, config: FlowCardPlusConfig) =>
  getEntityStateWatts(hass, config.entities.inverter?.entity);

export const getDirectLoadsState = (hass: HomeAssistant, config: FlowCardPlusConfig) =>
  getEntityStateWatts(hass, config.entities.direct_loads?.entity);
