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
