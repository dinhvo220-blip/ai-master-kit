import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Demo, TOTAL} from './Demo';
const Root: React.FC = () => React.createElement(Composition, {id: 'KieuChuDemo', component: Demo as any, defaultProps: {safe: false}, durationInFrames: Math.round(TOTAL * 30), fps: 30, width: 1080, height: 1920});
registerRoot(Root);
