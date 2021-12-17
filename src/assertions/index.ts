// @ts-expect-error ts-migrate(7016) FIXME: Could not find a declaration file for module 'impo... Remove this comment to see the full error message
import importAll from "import-all.macro";

const imports = importAll.sync("./*/index.js");

export default Object.keys(imports)
  .map((key) => imports[key])
  .reduce((acc, assertion) => ({ ...acc, ...assertion.default }), {});
