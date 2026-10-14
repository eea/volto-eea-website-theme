// Missing or failed SSR settings never enable AI. Ordinary editing remains
// available; do not fetch configuration independently from individual widgets.
export const isImageAIEnabled = (state) => {
  const asyncState = state.reduxAsyncConnect;
  const settings = asyncState?.genAISettings;
  return Boolean(
    !asyncState?.loadState?.genAISettings?.error &&
      settings?.enabled === true &&
      settings?.features?.image?.enabled === true,
  );
};
