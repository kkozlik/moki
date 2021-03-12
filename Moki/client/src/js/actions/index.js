
export function addFilter(payload) {
  return { type: "ADD_FILTER", payload }
};

export function assignType(payload) {
  return { type: "ASSIGN_TYPE", payload }
};

export function setTimerange_gte(payload) {
  return { type: "SET_TIMERANGE_GTE", payload }
};

export function setTimerange_lte(payload) {
  return { type: "SET_TIMERANGE_lTE", payload }
};

export function setTimerange(payload) {
  return { type: "SET_TIMERANGE", payload }
};

export function setFilters(payload) {
  return { type: "SET_FILTERS", payload }
};

export function setUser(payload) {
  return { type: "SET_USER", payload }
};

export function setWidthChart(payload) {
  return { type: "SET_WIDTH_CHART", payload }
};

export function setProfile(payload) {
  return { type: "SET_PROFILE", payload }
};


