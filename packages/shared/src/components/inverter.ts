import { type CardMainContext, type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { displayValue } from "@flixlix-cards/shared/utils/display-value";
import { html, nothing } from "lit";

export const inverterElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  { inverter }: { inverter: any }
) => {
  const disableEntityClick = config.clickable_entities === false;

  return html`
    <div class="circle-container battery">
      <div
        class="circle ${disableEntityClick || !inverter.entity ? "pointer-events-none" : ""}"
        @click=${(e: MouseEvent) => main.onEntityClick(e, inverter, inverter.entity)}
        @dblclick=${(e: MouseEvent) => main.onEntityDoubleClick(e, inverter, inverter.entity)}
        @pointerdown=${(e: PointerEvent) => main.onEntityPointerDown(e, inverter, inverter.entity)}
        @pointerup=${(e: PointerEvent) => main.onEntityPointerUp(e)}
        @pointercancel=${(e: PointerEvent) => main.onEntityPointerUp(e)}
        @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
          if (e.key === "Enter") main.openDetails(e, inverter, inverter.entity, "tap");
        }}
      >
        <ha-ripple .disabled=${disableEntityClick || !inverter.entity}></ha-ripple>
        ${inverter.icon !== " " ? html`<ha-icon .icon=${inverter.icon}></ha-icon>` : nothing}
        <span>
          ${displayValue(main.hass, config, inverter.state, {
            unit: inverter.unit,
            unitWhiteSpace: inverter.unit_white_space,
            decimals: inverter.decimals,
          })}
        </span>
      </div>
      <span class="label">${inverter.name}</span>
    </div>
  `;
};
