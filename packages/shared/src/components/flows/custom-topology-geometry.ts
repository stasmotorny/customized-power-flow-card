export const CUSTOM_TOPOLOGY_VIEW_BOX = "0 0 100 340";

type CustomTopologyPoint = Readonly<{
  x: number;
  y: number;
}>;

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

export const CUSTOM_TOPOLOGY_NODE_CENTERS = {
  grid: { x: CUSTOM_TOPOLOGY_X.grid, y: CUSTOM_TOPOLOGY_Y.middle },
  breaker: { x: CUSTOM_TOPOLOGY_X.breaker, y: CUSTOM_TOPOLOGY_Y.middle },
  inverter: { x: CUSTOM_TOPOLOGY_X.inverter, y: CUSTOM_TOPOLOGY_Y.middle },
  home: { x: CUSTOM_TOPOLOGY_X.home, y: CUSTOM_TOPOLOGY_Y.middle },
  directLoads: { x: CUSTOM_TOPOLOGY_X.breaker, y: CUSTOM_TOPOLOGY_Y.directLoads },
  solar: { x: CUSTOM_TOPOLOGY_X.inverter, y: CUSTOM_TOPOLOGY_Y.solar },
  battery: { x: CUSTOM_TOPOLOGY_X.inverter, y: CUSTOM_TOPOLOGY_Y.battery },
  rightTopIndividual: { x: CUSTOM_TOPOLOGY_X.home, y: CUSTOM_TOPOLOGY_Y.solar },
  rightBottomIndividual: { x: CUSTOM_TOPOLOGY_X.home, y: CUSTOM_TOPOLOGY_Y.battery },
} as const satisfies Record<string, CustomTopologyPoint>;

export type CustomTopologyNodeName = keyof typeof CUSTOM_TOPOLOGY_NODE_CENTERS;

export const customTopologyPath = (
  source: CustomTopologyNodeName,
  target: CustomTopologyNodeName
) => {
  const from = CUSTOM_TOPOLOGY_NODE_CENTERS[source];
  const to = CUSTOM_TOPOLOGY_NODE_CENTERS[target];

  if (from.x === to.x) return `M${from.x},${from.y} V${to.y}`;
  if (from.y === to.y) return `M${from.x},${from.y} H${to.x}`;

  return `M${from.x},${from.y} V${to.y} H${to.x}`;
};

export const customTopologyIndividualKeyPoints = (invertAnimation?: boolean) =>
  invertAnimation ? "1;0" : "0;1";
