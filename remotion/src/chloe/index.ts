import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Chloe} from './Chloe';
import data from './chloe.json';
const Root: React.FC = () => React.createElement(Composition as any, {id: 'ChloeStory', component: Chloe, durationInFrames: (data as any).frames, fps: 30, width: 1080, height: 1920});
registerRoot(Root);
