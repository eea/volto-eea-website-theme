// Volto 19 provides this helper in `@plone/volto/helpers/Utils/Utils`. Keep the
// implementation local until Volto 18 is no longer supported, so the same
// add-on build works on both.
export function isIMEComposing(event) {
  const nativeEvent = event?.nativeEvent ?? event;
  return Boolean(nativeEvent?.isComposing) || nativeEvent?.keyCode === 229;
}
