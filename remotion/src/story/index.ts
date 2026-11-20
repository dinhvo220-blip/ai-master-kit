import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {Story} from './Story';
import data from './story.json';
const Root: React.FC = () => React.createElement(Composition as any, {id: 'BurberryStory', component: Story, durationInFrames: (data as any).frames, fps: 30, width: 1080, height: 1920});
registerRoot(Root);
