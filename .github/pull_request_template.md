---
name: Initial pull request
about: When you've just generated this repository and you want to get to work.
---

# Everything

This pull request adds everything the project needs to be at its first release.

# TODO

- [ ] Update `author-name` and `repo-owner` in `.config` and
      ensure the tests pass.

- [ ] Name the project:
    - Change `repo-name` in `.config` and ensure the tests pass.
    - Change the header of the documentation in `index.js`.
    - Replace occurrences of `fluture-project` in `index.js`.
    - Change the value of `output.name` in `rollup.config.js`.
    - Replace occurrences of `flutureProject` in `index.js` to follow the value of `output.name` from the previous step.

- [ ] Describe the project:
    - Change `description` in `package.json`.
    - Update the GitHub repo description.
    - Update the description to the documentation in `index.js`.
    - Add additional `tags` in `package.json`.

- [ ] If this is a node-only module, remove browser support:
    - Remove browser usage instructions from the README.
    - Change `umd` to `cjs` in `rollup.config.js` and remove `output.name`.
    - Change `eslint-es3` to `eslint-es6` in `.eslintrc.json`.
    - Change `shared-node-browser` to `node` in `.eslintrc.json`.

- [ ] Set up integration with Codecov:
    - Find the Codecov token in the Codecov settings for your new repository:
      https://codecov.io/gh/{owner}/{repository}/settings.
    - Save it as `CODECOV_TOKEN` in the secrets for your new repository:
      https://github.com/{owner}/{repository}/settings/secrets.

- [ ] Remove or update `.github/pull_request_template.md`.

- [ ] Write the code.
