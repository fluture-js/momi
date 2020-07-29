export default {
  input: 'index.js',
  external: [
    'fluture',
    'http',
    'monastic/index.js',
    'sanctuary-type-classes',
  ],
  output: {
    format: 'cjs',
    name: 'momi',
    file: 'index.cjs',
    interop: false,
    paths: {
      'monastic/index.js': 'monastic',
    },
    globals: {
      'fluture/index.js': 'Fluture',
      'monastic/index.js': 'monastic',
    },
  },
};
