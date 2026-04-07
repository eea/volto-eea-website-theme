/* eslint-disable no-restricted-syntax */
export default function ImageViewWidget({ value }) {
  return <img src={value?.download} alt={value?.filename} />;
}
