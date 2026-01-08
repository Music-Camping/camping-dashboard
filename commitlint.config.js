module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // Type validation
    "type-enum": [
      2,
      "always",
      [
        "feat", // New feature
        "fix", // Bug fix
        "docs", // Documentation only changes
        "style", // Code style changes (formatting, missing semi colons, etc)
        "refactor", // Code refactoring
        "perf", // Performance improvements
        "test", // Adding missing tests or correcting existing tests
        "build", // Changes that affect the build system or dependencies
        "ci", // Changes to CI configuration files and scripts
        "chore", // Other changes that don't modify src or test files
        "revert", // Reverts a previous commit
        "security", // Security improvements
        "deps", // Dependency updates
      ],
    ],

    // Type casing
    "type-case": [2, "always", "lower-case"],

    // Type must not be empty
    "type-empty": [2, "never"],

    // Subject validation
    "subject-empty": [2, "never"],
    "subject-case": [
      2,
      "always",
      [
        "sentence-case",
        "start-case",
        "pascal-case",
        "upper-case",
        "lower-case",
      ],
    ],
    "subject-full-stop": [2, "never", "."],
    "subject-max-length": [2, "always", 100],

    // Body validation
    "body-leading-blank": [2, "always"],
    "body-max-line-length": [2, "always", 100],

    // Footer validation
    "footer-leading-blank": [2, "always"],
    "footer-max-line-length": [2, "always", 100],

    // Header validation
    "header-max-length": [2, "always", 100],

    // Scope validation (optional)
    "scope-case": [2, "always", "lower-case"],

    // Allow specific patterns
    "scope-enum": [
      2,
      "always",
      [
        "api",
        "ui",
        "dashboard",
        "auth",
        "cache",
        "config",
        "deps",
        "types",
        "hooks",
        "components",
        "utils",
        "styles",
        "tests",
        "ci",
        "release",
      ],
    ],
  },
  prompt: {
    questions: {
      type: {
        description: "Select the type of change that you're committing",
        enum: {
          feat: {
            description: "A new feature",
            title: "Features",
            emoji: "✨",
          },
          fix: {
            description: "A bug fix",
            title: "Bug Fixes",
            emoji: "🐛",
          },
          docs: {
            description: "Documentation only changes",
            title: "Documentation",
            emoji: "📚",
          },
          style: {
            description:
              "Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)",
            title: "Styles",
            emoji: "💎",
          },
          refactor: {
            description:
              "A code change that neither fixes a bug nor adds a feature",
            title: "Code Refactoring",
            emoji: "📦",
          },
          perf: {
            description: "A code change that improves performance",
            title: "Performance Improvements",
            emoji: "🚀",
          },
          test: {
            description: "Adding missing tests or correcting existing tests",
            title: "Tests",
            emoji: "🚨",
          },
          build: {
            description:
              "Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)",
            title: "Builds",
            emoji: "🛠",
          },
          ci: {
            description:
              "Changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)",
            title: "Continuous Integrations",
            emoji: "⚙️",
          },
          chore: {
            description: "Other changes that don't modify src or test files",
            title: "Chores",
            emoji: "♻️",
          },
          revert: {
            description: "Reverts a previous commit",
            title: "Reverts",
            emoji: "🗑",
          },
        },
      },
      scope: {
        description:
          "What is the scope of this change (e.g. component or file name)",
      },
      subject: {
        description:
          "Write a short, imperative tense description of the change",
      },
      body: {
        description: "Provide a longer description of the change",
      },
      isBreaking: {
        description: "Are there any breaking changes?",
      },
      breakingBody: {
        description:
          "A BREAKING CHANGE commit requires a body. Please enter a longer description of the commit itself",
      },
      breaking: {
        description: "Describe the breaking changes",
      },
      isIssueAffected: {
        description: "Does this change affect any open issues?",
      },
      issuesBody: {
        description:
          "If issues are closed, the commit requires a body. Please enter a longer description of the commit itself",
      },
      issues: {
        description: 'Add issue references (e.g. "fix #123", "re #123".)',
      },
    },
  },
};

/*
===========================================
EXEMPLOS DE COMMITS VÁLIDOS
===========================================

feat: add user authentication
feat(auth): implement JWT token validation
feat(dashboard): add social media metrics chart

fix: resolve cache invalidation issue
fix(api): correct error handling in client
fix(ui): fix button hover state

docs: update README with setup instructions
docs(api): add JSDoc comments to functions

style: format code with prettier
style(components): remove unused imports

refactor: reorganize folder structure
refactor(hooks): simplify useSocialData logic

perf: optimize image loading
perf(cache): reduce cache lookup time

test: add unit tests for API client
test(hooks): add tests for useSocialData

build: update next.js to v14
build(deps): upgrade tailwindcss

ci: add GitHub Actions workflow
ci: fix deployment script

chore: update dependencies
chore(release): bump version to 1.0.0

security: fix XSS vulnerability
security(auth): strengthen password validation

deps: update axios to v1.7.0
deps: upgrade all dependencies

===========================================
COMMITS COM BREAKING CHANGES
===========================================

feat!: change API response structure

BREAKING CHANGE: API responses now use camelCase instead of snake_case

===========================================
COMMITS COM ISSUES
===========================================

fix: resolve cache issue

Closes #123
Fixes #456
Related to #789

===========================================
*/
