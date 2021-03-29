import { SET_FILTERS } from "../constants/action-types";
import { ASSIGN_TYPE } from "../constants/action-types";
import { SET_TIMERANGE } from "../constants/action-types";
import { SET_USER } from "../constants/action-types";
import { SET_WIDTH_CHART } from "../constants/action-types";
import { SET_PROFILE } from "../constants/action-types";
import { SET_USER_PROFILE } from "../constants/action-types";

const initialState = {
  types: [],
  filters: [],
  timerange: [(Math.round(new Date().getTime() / 1000) - (6 * 3600)) * 1000, (Math.round(new Date().getTime() / 1000)) * 1000, new Date(Math.trunc(Math.round(new Date().getTime() / 1000) - (6 * 3600)) * 1000).toLocaleString() + " + 6 hours"],
  user: null,
  width: window.innerWidth,
  error: "",
  profile: []
};


function rootReducer(state = initialState, action) {

  if (action.type === ASSIGN_TYPE) {
    return Object.assign({}, state, {
      types: action.payload
    });
  }

  else if (action.type === SET_TIMERANGE) {
    return Object.assign({}, state, {
      timerange: action.payload
    });
  }

  else if (action.type === SET_FILTERS) {
    return Object.assign({}, state, {
      filters: action.payload
    });
  }

  else if (action.type === SET_USER) {
    return Object.assign({}, state, {
      user: action.payload
    });
  }

  else if (action.type === SET_WIDTH_CHART) {
    return Object.assign({}, state, {
      width: action.payload
    });
  }

  else if (action.type === SET_PROFILE) {
    return Object.assign({}, state, {
      profile: action.payload
    });
  }

  else if (action.type === SET_USER_PROFILE) {
    var key = Object.keys(action.payload)[0];
    var profileNew = state.profile[0].userprefs[key] = action.payload[key];
    return {
      ...state,
      profileNew
    }
  }
  return state;
}
export default rootReducer;