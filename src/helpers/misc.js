/**
 * @description General helpers
 * 
 * @sleep Set timeout to control exection flow.
*/

export function sleep(ms = 2000) {
  return new Promise((r) => setTimeout(r, ms));
}