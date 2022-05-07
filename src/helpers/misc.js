import chalk from "chalk";

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

export function apiError(msg, err) {
  let restError = "";
  if (err.response.error) {
    const errJson = JSON.parse(err.response.error.text);
    
    if (errJson.allowance && errJson.allowance.upgrade) {
      errJson.error = `Market not available. ${errJson.allowance.upgrade}.`;
    }

    restError = `${errJson.error} Status code: ${err.response.error.status}`;
  }
  
  throw new Error(
    `${chalk.bgYellow.red(restError ? restError : msg)}\n${chalk.red("If the problem persists, please contact us at: https://github.com/aange-marcel/cryptoExport/issues/new.\n")}`, (err && !err.response.error) ? {cause: err} : ""
  );
}