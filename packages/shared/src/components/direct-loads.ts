import { type CardMainContext, type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { displayValue } from "@flixlix-cards/shared/utils/display-value";
import { html, nothing } from "lit";

export const directLoadsElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  { directLoads }: { directLoads: any }
) => {
  const disableEntityClick = config.clickable_entities === false;

  return html`
    <div class="circle-container individual-top">
      <div
        class="circle ${disableEntityClick || !directLoads.entity ? "pointer-events-none" : ""}"
        @click=${(e: MouseEvent) => main.onEntityClick(e, directLoads, directLoads.entity)}
        @dblclick=${(e: MouseEvent) => main.onEntityDoubleClick(e, directLoads, directLoads.entity)}
        @pointerdown=${(e: PointerEvent) =>
          main.onEntityPointerDown(e, directLoads, directLoads.entity)}
        @pointerup=${(e: PointerEvent) => main.onEntityPointerUp(e)}
        @pointercancel=${(e: PointerEvent) => main.onEntityPointerUp(e)}
        @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
          if (e.key === "Enter") main.openDetails(e, directLoads, directLoads.entity, "tap");
        }}
      >
        <ha-ripple .disabled=${disableEntityClick || !directLoads.entity}></ha-ripple>
        ${directLoads.icon !== " " ? html`<ha-icon .icon=${directLoads.icon}></ha-icon>` : nothing}
        <span>
          ${displayValue(main.hass, config, directLoads.state, {
            unit: directLoads.unit,
            unitWhiteSpace: directLoads.unit_white_space,
            decimals: directLoads.decimals,
          })}
        </span>
      </div>
      <span class="label">${directLoads.name}</span>
    </div>
  `;
};
