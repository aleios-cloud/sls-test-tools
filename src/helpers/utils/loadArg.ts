import yargs from "yargs";

const argv = yargs(process.argv).argv as Record<string, unknown>;

const isNonEmptyString = (arg: unknown): arg is string =>
  typeof arg === "string" && arg !== "";

export const loadArg = ({
  cliArg,
  processEnvName,
  defaultValue,
}: {
  cliArg: string;
  processEnvName: string;
  defaultValue?: string;
}): string => {
  let arg = argv[cliArg];

  if (isNonEmptyString(arg)) {
    return arg;
  }

  arg = process.env[processEnvName];

  if (isNonEmptyString(arg)) {
    return arg;
  }

  if (defaultValue === undefined) {
    throw new Error(
      `--${cliArg} CLI argument or ${processEnvName} env var required.`
    );
  }

  return defaultValue;
};
