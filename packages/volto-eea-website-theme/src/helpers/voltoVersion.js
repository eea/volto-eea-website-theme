import voltoPackageJson from '@plone/volto/../package.json';

// Lets the shadows pick between Volto 18 and Volto 19 behaviour at runtime,
// so the same add-on build works on both. Remove once Volto 18 is no longer
// supported.
export const isVolto18 = `${voltoPackageJson.version}`.startsWith('18.');
