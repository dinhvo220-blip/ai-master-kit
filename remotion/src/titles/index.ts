import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Titles, TOTAL} from './Titles';
const Root: React.FC = () => React.createElement(Composition, {id: 'TitleMau', component: Titles as any, defaultProps: {safe: false}, durationInFrames: Math.round(TOTAL * 30), fps: 30, width: 1080, height: 1920});
registerRoot(Root);
