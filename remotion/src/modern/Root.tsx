import React from 'react';
import {Composition} from 'remotion';
import {Modern} from './Modern';
import data from './bf_multi.json';
export const Root: React.FC = () => (
  <Composition id="BFMulti" component={Modern as any} defaultProps={{d: data}} durationInFrames={(data as any).frames} fps={30} width={1080} height={1920} />
);
