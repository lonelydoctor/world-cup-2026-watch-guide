# Security Policy

## Supported Versions

This repository is a small demo application. Security fixes are applied to the latest version on the default branch.

## Reporting a Vulnerability

Please do not open a public issue for a suspected security vulnerability.

Report privately through GitHub private vulnerability reporting if it is enabled for the repository. If that is not available, contact the maintainer through the repository owner's public profile.

Include:

- A concise description of the issue.
- Steps to reproduce.
- Affected route, script, or package.
- Any evidence that the issue can expose user data, execute code, or alter generated match data.

## Scope

In scope:

- API routes under `src/app/api`.
- Data refresh scripts.
- Client-side reminder, favorite, share, and calendar export logic.
- Dependency vulnerabilities that affect this app at runtime.

Out of scope:

- Issues in third-party data sources.
- Browser notification behavior controlled by the user's browser.
- Inaccurate match data caused by upstream public source changes, unless it also creates a security risk.
