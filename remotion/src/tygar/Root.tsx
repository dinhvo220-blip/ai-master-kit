import React from 'react';
import {Composition} from 'remotion';
import {Tygar, TOTAL} from './Tygar';
export const Root: React.FC = () => (
  <Composition id="TygarGfx" component={Tygar as any} defaultProps={{preview: true, safe: true}} durationInFrames={Math.round(TOTAL * 30)} fps={30} width={1080} height={1920} />
);
