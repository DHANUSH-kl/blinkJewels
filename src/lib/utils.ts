// /lib/utils.ts

export function parseQueryParams(params: any) {
  const result: any = {};

  if (params.type) result.type = params.type;
  if (params.category) result.category = params.category;
  if (params.minPrice) result.minPrice = params.minPrice;
  if (params.maxPrice) result.maxPrice = params.maxPrice;

  return result;
}
