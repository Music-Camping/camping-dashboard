const path = require("path");

const buildEslintCommand = (filenames) => {
  // Filter out config files that shouldn't be linted
  const filesToLint = filenames.filter(
    (f) =>
      !f.includes(".lintstagedrc") &&
      !f.includes("commitlint.config") &&
      !f.includes("tailwind.config"),
  );

  if (filesToLint.length === 0) return 'echo "No files to lint"';

  return `eslint --fix --max-warnings=10 ${filesToLint
    .map((f) => path.relative(process.cwd(), f))
    .join(" ")}`;
};

module.exports = {
  // TypeScript/JavaScript files (excluding config files)
  "*.{js,jsx,ts,tsx}": [buildEslintCommand, "prettier --write"],

  // JSON, Markdown, CSS files
  "*.{json,md,mdx,css,yaml,yml}": ["prettier --write"],

  // Package.json - format only
  "package.json": ["prettier --write"],
};
