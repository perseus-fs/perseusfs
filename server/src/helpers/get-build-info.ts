import info from '../build.json' with { type: 'string' };
import type { TBuildInfo } from '../types';

const getBuildInfo = (): TBuildInfo => {
  return {
    version: info.version,
    date: info.buildTime,
    env: info.env as 'development' | 'production'
  };
};

export { getBuildInfo };
