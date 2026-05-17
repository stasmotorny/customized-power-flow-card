import { html } from "lit";

export const directLoadsElement = () => {
  return html`
    <div class="circle-container individual-top">
      <div class="circle">
        <ha-icon .icon=${"mdi:home-lightning-bolt"}></ha-icon>
        <span>TEST</span>
      </div>
      <span class="label">Потужні прилади</span>
    </div>
  `;
};
