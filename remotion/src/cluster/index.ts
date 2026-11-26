import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ClusterDemo, TOTAL} from './Cluster';
const Root: React.FC = () => React.createElement(Composition, {id: 'ClusterDemo', component: ClusterDemo as any, durationInFrames: Math.round(TOTAL * 30), fps: 30, width: 1080, height: 1920});
registerRoot(Root);
