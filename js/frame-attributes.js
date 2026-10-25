// Attribute names consumed by frame selectors in css/app.css.
export const FRAME_ATTRIBUTES = Object.freeze({
  style: 'data-frame',
  target: 'data-target',
  outer: 'data-outer',
  ornament: 'data-ornament',
  hideFrames: 'data-hide-frames',
});

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
