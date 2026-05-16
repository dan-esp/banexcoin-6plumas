/**
 * @type {import('semantic-release').GlobalConfig}
 */
export default {
  branches: ['main'],
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'conventionalcommits'
      }
    ],
    [
      '@semantic-release/release-notes-generator',
      {
        preset: 'conventionalcommits',
        writerOpts: {
          commitsSort: ['subject', 'scope']
        },
        presetConfig: {
          types: [
            { type: 'feat', section: 'Features' },
            { type: 'fix', section: 'Bug Fixes' },
            { type: 'chore', section: 'chore' },
            { type: 'docs', section: 'Docs' },
            { type: 'style', hidden: true },
            { type: 'refactor', section: 'Refactor' },
            { type: 'perf', section: 'Perf' },
            { type: 'test', section: 'Test' },
            { type: 'build', section: 'build' },
            { type: 'ci', section: 'CI' }
          ]
        }
      }
    ],
    '@semantic-release/github'
  ]
};
