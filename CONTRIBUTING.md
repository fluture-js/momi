# Contribution Guideline

## Making a contribution

1. Fork the repo if you do not have write access
1. Clone the remote (fork) from GitHub
1. Create a branch named `<yourgithubusername>/<yourfeature>`
1. Make one or more atomic commits
1. Make sure the tests pass locally
1. Create a pull request on GitHub

## Publishing a new version

1. Make sure you have write access to the module on npm
1. Make sure you have write access to the master branch on GitHub
1. Checkout `master` and make sure it's up to date with the remote
1. Run `npm run release <level>`, where `<level>` can be any of: 'major',
   'minor', 'patch', 'premajor', 'preminor', 'prepatch', or 'prerelease'.

## Dependency Management

When adding a dependency, first consider whether to add it as
a *regular* or as a *peer* dependency.

Make sure to update `rollup.config.js` and the usage instructions in `index.js`
after installing a new dependency . Peer dependencies need to be included in the
`npm install` example, and all dependencies need to be mentioned in the UMD
scripting instructions.

### Regular Dependency

Choose a regular dependency when its internal structure is hidden from the
end-user. For example, if you depend on Fluture internally, but never expose
Future instances from any of your public facing functions.

The version of a regular dependency should be pinned at the major version
number. For example `^1.1.0` would allow any versions greater than `1.1.0` and
smaller than `2.0.0`.

### Peer Dependency

Choose a peer dependency when any of its internal structure is exposed to the
end-user. For example, if you depend on Fluture and return Future instances
from public-facing functions, then you should add Fluture as a peer dependency.

The version range of peer dependencies should be as wide as you can make it.
For example, if you code works with Fluture version 1 as well as version 2, then
your dependency range should be `>=1.0.0 <3.0.0`. Then whenever a new compatible
version of Fluture is released, you bump the upper bound to include it. If you
have to make a breaking change to support the new version of the peer dependency
then you reset the lower bound.

### Package Lock

We don't use a package lock file, because this is a library, not a tool. The
reproducible builds provided by a package lock would benefit the developers of
the library, but not its users. When users install this library, the
`package.json` file is used to resolve the versions of sub-depdencies. This
means that even if the developers of this library would have a working
reproducible build, the library might be installing broken dependencies for its
users. The trade-off we're making here is that we lose build reproducibility in
development, but we gain an earlier insight in when a dependency is broken.
