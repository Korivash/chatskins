/**
 * Browser module frame-attributes.js implements one ChatSkins page or overlay feature.
 * Used by the site, editor, or OBS overlay module graph.
 * Main exports: datasetProperty, frameAttributes.
 * Invariant: preserve existing settings links and render chat content as text.
 */
// Attribute names consumed by frame selectors in css/app.css.
export const FRAME_ATTRIBUTES = Object.freeze({
  style: 'data-frame',
  target: 'data-target',
  outer: 'data-outer',
  ornament: 'data-ornament',
  hideFrames: 'data-hide-frames',
});


/** Handle property.
 * @param {unknown} attribute Function input.
 * @returns {unknown} The function result.
 */
export function datasetProperty(attribute) {
  return attribute.replace(/^data-/, '').replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
  
}

/** Handle attributes.
 * @param {unknown} settings Function input.
 * @returns {unknown} The function result.
 */
export function frameAttributes(settings) {
  const frame = settings.frame;
  
  return {
    [FRAME_ATTRIBUTES.style]: frame.style,
    [FRAME_ATTRIBUTES.target]: frame.target,
    [FRAME_ATTRIBUTES.outer]: String(!!frame.outer.enabled),
    [FRAME_ATTRIBUTES.ornament]: frame.ornament.style,
    [FRAME_ATTRIBUTES.hideFrames]: String(!!settings.hideFrames),
  };
  
}
