import { svg } from "lit";

export const CUSTOM_TOPOLOGY_DOT_RX = 0.6;
export const CUSTOM_TOPOLOGY_DOT_RY = 3;

type CustomTopologyDotOptions = {
  className: string;
  duration: number | undefined;
  pathId: string;
  invertAnimation?: boolean;
};

/**
 * Custom-topology overlays use preserveAspectRatio="none" to keep paths aligned
 * to the card grid. A normal SVG circle would be non-uniformly scaled into a
 * pill in that coordinate space, so custom topology particles are compensated
 * ellipses instead of distorted circles.
 */
export const customTopologyDot = ({
  className,
  duration,
  pathId,
  invertAnimation,
}: CustomTopologyDotOptions) => svg`
  <ellipse
    rx="${CUSTOM_TOPOLOGY_DOT_RX}"
    ry="${CUSTOM_TOPOLOGY_DOT_RY}"
    class="${className} custom-topology-dot"
    vector-effect="non-scaling-stroke"
  >
    <animateMotion
      dur="${duration}s"
      repeatCount="indefinite"
      calcMode="paced"
      keyPoints="${invertAnimation ? "1;0" : "0;1"}"
      keyTimes="0;1"
    >
      <mpath href="#${pathId}" xlink:href="#${pathId}" />
    </animateMotion>
  </ellipse>
`;
