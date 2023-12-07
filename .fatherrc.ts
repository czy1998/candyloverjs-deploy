import { defineConfig } from 'father';

export default defineConfig({
    cjs: {
        input: 'src',
        output: 'lib',
        platform: 'node',
        transformer: 'babel'
    }
});

// more father config: https://github.com/umijs/father/blob/master/docs/config.md