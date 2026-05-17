import { type CardMainContext, type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { displayValue } from "@flixlix-cards/shared/utils/display-value";
import { html, nothing } from "lit";

export type CustomPowerNode = {
  entity?: string;
  has: boolean;
  icon: string;
  name: string;
  state: number | null;
  unit?: string;
  unit_white_space?: boolean;
  decimals?: number;
  display_zero_state?: boolean;
  tap_action?: any;
  hold_action?: any;
  double_tap_action?: any;
};

export const customPowerNodeElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  node: CustomPowerNode,
  className: string,
  iconId?: string
) => {
  const disableEntityClick = config.clickable_entities === false;
  return html`
    <div class="circle-container ${className}">
      <div
        class="circle ${disableEntityClick ? "pointer-events-none" : ""}"
        @click=${(e: MouseEvent) => {
          main.onEntityClick(e, node, node.entity);
        }}
        @dblclick=${(e: MouseEvent) => {
          main.onEntityDoubleClick(e, node, node.entity);
        }}
        @pointerdown=${(e: PointerEvent) => {
          main.onEntityPointerDown(e, node, node.entity);
        }}
        @pointerup=${(e: PointerEvent) => {
          main.onEntityPointerUp(e);
        }}
        @pointercancel=${(e: PointerEvent) => {
          main.onEntityPointerUp(e);
        }}
        @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
          if (e.key === "Enter") {
            main.openDetails(e, node, node.entity, "tap");
          }
        }}
      >
        <ha-ripple .disabled=${disableEntityClick}></ha-ripple>
        ${node.icon !== " "
          ? html`<ha-icon id=${iconId ?? nothing} .icon=${node.icon}></ha-icon>`
          : nothing}
        ${node.display_zero_state !== false || (node.state ?? 0) > 0
          ? html`<span>
              ${displayValue(main.hass, config, node.state, {
                decimals: node.decimals,
                unit: node.unit,
                unitWhiteSpace: node.unit_white_space,
              })}
            </span>`
          : nothing}
      </div>
      <span class="label">${node.name}</span>
    </div>
  `;
};
