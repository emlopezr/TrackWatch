# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of TrackWatch seriously. If you have discovered a security vulnerability, we appreciate your help in disclosing it to us in a responsible manner.

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please follow these steps:

1.  **Private Reporting:** If you believe you have found a security vulnerability, please report it by emailing the maintainers directly or using GitHub's "Private Vulnerability Reporting" feature if enabled for this repository.
2.  **Details:** Please provide as much detail as possible, including:
    *   The type of vulnerability (e.g., SQL injection, XSS, RCE).
    *   Full paths to affected files or code snippets.
    *   Step-by-step instructions to reproduce the issue.
    *   Proof-of-concept (PoC) code or screenshots if applicable.
3.  **Response:** We will acknowledge receipt of your report and do our best to triage the issue promptly. We will keep you updated on our progress.

## Security Best Practices for Users

Since TrackWatch is a self-hosted application handling sensitive data (Spotify tokens), we recommend the following:

*   **HTTPS:** Always run TrackWatch behind a reverse proxy with HTTPS enabled (e.g., using Nginx with Let's Encrypt) when exposing it to the internet.
*   **Secrets:** Keep your `SECRET_KEY`, `DATABASE_PASSWORD`, and `SPOTIFY_CLIENT_SECRET` secure. Do not commit them to version control.
*   **Updates:** Keep your Docker images and codebase up to date to receive the latest security patches.
