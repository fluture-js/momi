import pkg from './package.json';

const dependencyNames = Array.prototype.concat.call (
  Object.keys (pkg.dependencies),
  Object.keys (pkg.peerDependencies)
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
      'sanctuary-type-classes': 'sanctuaryTypeClasses',
    },
  },
};
