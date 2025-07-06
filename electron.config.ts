// electron.config.ts
export default {
  main: './main/src/index.ts',
  preload: './main/src/preload.ts',
  renderer: 'http://localhost:3000',
};
