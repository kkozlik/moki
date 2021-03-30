import { SET_USER } from "../constants/action-types";
import { SET_WIDTH_CHART } from "../constants/action-types";
import { SET_PROFILE } from "../constants/action-types";
import { SET_USER_PROFILE } from "../constants/action-types";
import {SET_LAYOUT} from "../constants/action-types";

const initialState = {
  user: null,
  width: window.innerWidth,
  profile: [],
  layout: []
};


function persistentReducer(state = initialState, action) {

if (action.type === SET_USER) {
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

  else if (action.type === SET_LAYOUT) {
    return Object.assign({}, state, {
      layout: action.payload
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
export default persistentReducer;