export const isNotEmptyArray = (el) => (Array.isArray(el) && el.length > 0);

export const isNotEmptyObject = (obj) => !(obj && obj.constructor === Object && Object.entries(obj).length === 0);

export const hasAnyValue = (el) => (el || typeof el === 'number');

export const isString = (string) => (string && typeof string === "string");