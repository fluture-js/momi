import pkg from './package.json';

const dependencyNames = Array.prototype.concat.call (
  Object.keys (pkg.dependencies),
  Object.keys (pkg.peerDependencies),
  ['http']
);

export default {
  input: 'index.js',
  external: dependencyNames,
  output: {
    format: 'umd',
    file: 'dist/umd.js',
    name: 'momi',
    interop: false,
    exports: 'named',
    globals: {
      'fluture': 'Fluture',
      'monastic': 'monastic',
      'http': 'http',
      'sanctuary-type-classes': 'sanctuaryTypeClasses',
    },
  },
};
