// list of controllers for router path

import React from 'react';
import * as componentList from '@moki-client/gui/src/paths/index.js'
import {
    Route
} from 'react-router-dom';

function newComponent(name, tags, hostnames, dstRealms, srcRealms) {
    var ComponentToRender = componentList[name];
    return <ComponentToRender tags={tags} name={name}  hostnames={hostnames} dstRealms={dstRealms} srcRealms={srcRealms} />;
}

//returns path list from dashboard array
export const paths = (dashboards, tags, hostnames, dstRealms, srcRealms) => {
    var paths = [];
    paths = dashboards.map(e => <Route key={e} exact path={'/' + e} render={() => newComponent(e, tags, hostnames, dstRealms, srcRealms)} />);
    return paths;
}
