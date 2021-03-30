import { createStore } from "redux";
import persistentReducer from "../reducers/indexPersistent";

const persistentStore = createStore(persistentReducer);

export default persistentStore;