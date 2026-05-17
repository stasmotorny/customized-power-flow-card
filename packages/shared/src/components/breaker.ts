import { html } from "lit";

export const breakerElement = () => {
  return html`
    <div class="circle-container grid">
      <div class="circle">
        <ha-icon id="grid-icon" .icon=${"mdi:electric-switch"}></ha-icon>
        <span>TEST</span>
      </div>
      <span class="label">Вхідний автомат</span>
    </div>
  `;
};
