import { loadLazyImages } from './loadLazyImages';

describe('loadLazyImages', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <img loading="lazy" src="image1.jpg" />
      <img loading="lazy" src="image2.jpg" />
      <img loading="lazy" />
      <img loading="eager" src="image3.jpg" />
    `;
  });

  it('sets loading="eager" only on lazy-loaded images with a src', () => {
    loadLazyImages();

    const images = document.querySelectorAll('img');
    expect(images[0].getAttribute('loading')).toBe('eager'); // had src
    expect(images[1].getAttribute('loading')).toBe('eager'); // had src
    expect(images[2].getAttribute('loading')).toBe('lazy'); // no src
    expect(images[3].getAttribute('loading')).toBe('eager'); // already eager
  });
});
