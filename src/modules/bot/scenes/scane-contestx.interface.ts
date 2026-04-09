import { Context } from 'telegraf';

export interface SceneSession {
  current?: string;
  state?: any;
}

export interface SceneContext extends Context {
  scene: {
    enter: (sceneName: string, initialState?: any) => Promise<void>;
    leave: () => Promise<void>;
    current?: string;
    state?: any;
  };
  session: any;
}