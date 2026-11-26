import React from 'react';
import {Composition} from 'remotion';
import {Tygar} from './Tygar';
export const Root: React.FC = () => <Composition id="TygarCover" component={Tygar} durationInFrames={675} fps={30} width={1080} height={1920} />;
