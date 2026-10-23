/**
 * Forces all lazy-loaded images to load immediately by setting the loading attribute to 'eager'.
 */
export const loadLazyImages = () => {
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  lazyImages.forEach((img) => {
    if (img.src) {
      img.setAttribute('loading', 'eager');
    }
  });
};
