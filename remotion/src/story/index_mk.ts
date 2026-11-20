import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Story} from './Story';
import data from './mk/story.json';
const Root: React.FC = () => React.createElement(Composition as any, {id: 'BurberryMakeup', component: Story, durationInFrames: (data as any).frames, fps: 30, width: 1080, height: 1920, defaultProps: {d: data}});
registerRoot(Root);
