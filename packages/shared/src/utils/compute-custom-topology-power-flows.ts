export type CustomTopologyPowerFlows = {
  gridToBreaker: number;
  breakerToInverter: number;
  breakerToDirectLoads: number;
  inverterToHome: number;
  batteryToInverter: number;
  inverterToBattery: number;
};

type ComputeCustomTopologyPowerFlowsInput = {
  breakerInput?: number | null;
  inverterInput?: number | null;
  directLoadsInput?: number | null;
  batteryToHome?: number | null;
  inverterToBattery?: number | null;
};

const positive = (value?: number | null) => Math.max(value ?? 0, 0);

/**
 * Computes the branch values for the custom topology:
 * Grid → Breaker → Inverter → Home, with Direct loads branching off the breaker
 * and Battery connected to the inverter.
 *
 * Balancing policy:
 * - When directLoadsInput is configured, explicit branch values win and the
 *   breaker/grid incoming value is derived from breakerToInverter + directLoads.
 * - When directLoadsInput is missing, direct loads are derived from the measured
 *   breaker input minus the measured inverter branch: max(breaker - inverter, 0).
 *
 * This keeps the rendered topology internally consistent and prevents impossible
 * displays such as Breaker 221 W, Inverter 9 W, Direct loads 0 W.
 */
export const computeCustomTopologyPowerFlows = ({
  breakerInput,
  inverterInput,
  directLoadsInput,
  batteryToHome,
  inverterToBattery,
}: ComputeCustomTopologyPowerFlowsInput): CustomTopologyPowerFlows => {
  const breakerToInverter = positive(inverterInput);
  const breakerToDirectLoads =
    directLoadsInput === null || directLoadsInput === undefined
      ? Math.max(positive(breakerInput) - breakerToInverter, 0)
      : positive(directLoadsInput);
  const gridToBreaker = breakerToInverter + breakerToDirectLoads;
  const batteryToInverter = positive(batteryToHome);
  const inverterToBatteryPower = positive(inverterToBattery);

  return {
    gridToBreaker,
    breakerToInverter,
    breakerToDirectLoads,
    inverterToHome: Math.max(breakerToInverter + batteryToInverter - inverterToBatteryPower, 0),
    batteryToInverter,
    inverterToBattery: inverterToBatteryPower,
  };
};
