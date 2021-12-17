import matchers from "./assertions";

// @ts-expect-error ts-migrate(2339) FIXME: Property 'expect' does not exist on type 'Global &... Remove this comment to see the full error message
const jestExpect = global.expect;

if (jestExpect !== undefined) {
  jestExpect.extend(matchers);
} else {
  console.error("Unable to find Jest's global expect.");
}

export * from "./helpers";
