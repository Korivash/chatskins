/**
 * Small UI helpers for the guided Viewers switches.
 * Used by editor.html through js/editor.js.
 * Main export: syncSwitchLabel.
 * Invariant: visible switch copy always reflects the checked state.
 */

/** Keep the visible On/Off label in sync with a switch.
 * @param {{checked:boolean}|null} input The switch input.
 * @param {{textContent:string}|null} label The adjacent label text node.
 * @returns {void}
 */
export function syncSwitchLabel(input,label){
  if(!input||!label)return;
  label.textContent=input.checked?'On':'Off';
}
