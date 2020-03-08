export default {
  input: 'index.js',
  external: [
    'fluture',
    'http',
    'monastic/index.mjs',
    'sanctuary-type-classes',
  ],
  output: {
    format: 'cjs',
    name: 'momi',
    file: 'index.cjs',
    interop: false,
    paths: {
      'monastic/index.mjs': 'monastic/index.js',
    },
    globals: {
      'fluture/index.js': 'Fluture',
      'monastic/index.mjs': 'Monastic',
    },
  },
};
