/**
 * @description       Value validations that properly check truthy/falsy values for a better control flow.
 * 
 * @isNotEmptyArray   To check if array is empty, since [] is evaluated as truthy value.
 * @isNotEmptyObject  Same principle as above but with objects. 
 * @hasValue          Check if the variable has any possible valid value, the falsy "0" (zero) included.
 * @isString          Check if it is really a string!!
 */

export const isNotEmptyArray = (arr) => (Array.isArray(arr) && arr.length > 0);

export const isNotEmptyObject = (obj) => !(obj && obj.constructor === Object && Object.entries(obj).length === 0);

export const hasValue = (el) => (el || typeof el === 'number');

export const isString = (str) => (str && typeof str === "string");