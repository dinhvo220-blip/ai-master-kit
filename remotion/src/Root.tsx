import React from 'react';
import {Composition} from 'remotion';
import {Main} from './Main';
import data from './data.json';
export const Root: React.FC = () => (
  <>
    <Composition id="Gucci" component={Main} durationInFrames={(data as any).frames} fps={30} width={1080} height={1920} />
  </>
);
