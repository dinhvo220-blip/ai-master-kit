import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {ChloeTalk} from './ChloeTalk';
import data from './talk.json';
const Root: React.FC = () => React.createElement(Composition as any, {id: 'ChloeTalk', component: ChloeTalk, durationInFrames: (data as any).frames, fps: 30, width: 1080, height: 1920});
registerRoot(Root);
