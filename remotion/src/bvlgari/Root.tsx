import React from 'react';
import {Composition} from 'remotion';
import {Bv} from './Bv';
import data from './bv_gift.json';
export const Root: React.FC = () => (
  <Composition id="BvGift" component={Bv as any} defaultProps={{d: data}} durationInFrames={(data as any).frames} fps={30} width={1080} height={1920} />
);
