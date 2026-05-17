import { html } from "lit";

export const inverterElement = () => {
  return html`
    <div class="circle-container battery">
      <div class="circle">
        <ha-icon .icon=${"mdi:current-ac"}></ha-icon>
        <span>TEST</span>
      </div>
      <span class="label">Інвертор</span>
    </div>
  `;
};
