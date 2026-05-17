import { type CardMainContext, type FlowCardPlusConfig } from "@flixlix-cards/shared/types";
import { displayValue } from "@flixlix-cards/shared/utils/display-value";
import { html, nothing } from "lit";

export const breakerElement = (
  main: CardMainContext,
  config: FlowCardPlusConfig,
  { breaker }: { breaker: any }
) => {
  const disableEntityClick = config.clickable_entities === false;

  return html`
    <div class="circle-container grid">
      <div
        class="circle ${disableEntityClick || !breaker.entity ? "pointer-events-none" : ""}"
        @click=${(e: MouseEvent) => main.onEntityClick(e, breaker, breaker.entity)}
        @dblclick=${(e: MouseEvent) => main.onEntityDoubleClick(e, breaker, breaker.entity)}
        @pointerdown=${(e: PointerEvent) => main.onEntityPointerDown(e, breaker, breaker.entity)}
        @pointerup=${(e: PointerEvent) => main.onEntityPointerUp(e)}
        @pointercancel=${(e: PointerEvent) => main.onEntityPointerUp(e)}
        @keyDown=${(e: { key: string; stopPropagation: () => void; target: HTMLElement }) => {
          if (e.key === "Enter") main.openDetails(e, breaker, breaker.entity, "tap");
        }}
      >
        <ha-ripple .disabled=${disableEntityClick || !breaker.entity}></ha-ripple>
        ${breaker.icon !== " "
          ? html`<ha-icon id="grid-icon" .icon=${breaker.icon}></ha-icon>`
          : nothing}
        <span>
          ${displayValue(main.hass, config, breaker.state, {
            unit: breaker.unit,
            unitWhiteSpace: breaker.unit_white_space,
            decimals: breaker.decimals,
          })}
        </span>
      </div>
      <span class="label">${breaker.name}</span>
    </div>
  `;
};
