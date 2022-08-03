// https://github.com/nestjs/nest/issues/986#issuecomment-509295864

const tsConfigPaths = require('tsconfig-paths');
const tsConfig = require('./tsconfig.json');

const { paths, outDir, baseUrl } = tsConfig.compilerOptions;

tsConfigPaths.register({
  baseUrl: outDir,
  paths: Object.keys(paths).reduce(
    (agg, key) => ({
      ...agg,
      [key]: paths[key].map((p) => p.replace(baseUrl, outDir)),
    }),
    {}
  ),
});
