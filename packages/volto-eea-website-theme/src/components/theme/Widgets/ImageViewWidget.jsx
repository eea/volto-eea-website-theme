export default function ImageViewWidget({ value }) {
  // eslint-disable-next-line no-restricted-syntax
  return <img src={value?.download} alt={value?.filename} />;
}
