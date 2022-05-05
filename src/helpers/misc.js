/**
 * @description General helpers
 * 
 * @function sleep Set timeout to control exection flow.
 * @function apiError Presents the user with a proper error message.
 * 
*/

export function sleep(ms = 2000) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function apiError(msg, err) {
  throw new Error(
    `${msg}\n${chalk.blackBright("If the problem persists, please contact us at: https://github.com/aange-marcel/cryptoExport/issues/new.\n")}`,
    {cause: err}
  );
}