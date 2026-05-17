export const CUSTOM_TOPOLOGY_VIEW_BOX = "0 0 100 300";

export const CUSTOM_TOPOLOGY_X = {
  grid: 12.5,
  breaker: 37.5,
  inverter: 62.5,
  home: 87.5,
} as const;

export const CUSTOM_TOPOLOGY_Y = {
  directLoads: 40,
  solar: 60,
  middle: 170,
  battery: 280,
} as const;
