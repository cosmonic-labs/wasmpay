import {Plugin} from 'vite';
import {resolve} from 'node:path';
import fs from 'fs-extra';

type BuildCopyPluginConfig = {
  copyDir: string;
};

export default async function buildCopy(config: BuildCopyPluginConfig): Promise<Plugin> {
  let outDir: string;

  return {
    name: 'build-copy',
    apply: 'build',

    configResolved(resolvedConfig) {
      outDir = resolve(resolvedConfig.build.outDir);

      if (!outDir) {
        throw new Error('Output directory is not defined in Vite config.');
      }
    },

    async closeBundle(error) {
      if (error) {
        this.error(error);
      }

      try {
        const copySrcDir = resolve(outDir);
        const copyDestDir = resolve(config.copyDir);

        await fs.copy(copySrcDir, copyDestDir);

        console.log('Build process finished.');
      } catch (err) {
        throw new Error(`Error copying files: ${err}`);
      }
    },
  };
}
