# TrackWatch Data Handling Statement

**Last updated: January 2026**

## Self-Hosted Software Notice

TrackWatch is **self-hosted software**. This means:

- **You deploy and control your own instance** of TrackWatch
- **All data stays on your server** in your own PostgreSQL database
- **The developer [(@emlopezr](https://github.com/emlopezr)) has no access** to your data, tokens, or any information processed by your instance

This document describes how the TrackWatch application handles data locally on your self-hosted instance.

## Data Processed by Your Instance

When you connect your Spotify account to your TrackWatch instance, the application processes the following data locally:

### Spotify Account Information
- **User ID**: Used as the primary identifier in your local database
- **Display Name & Profile Image**: Displayed in the application interface
- **Email Address**: Used for optional email notifications (if configured)

### OAuth Tokens
- **Access Token & Refresh Token**: Stored in your local database to authenticate with Spotify's API
- These tokens are used exclusively by your instance to communicate with Spotify on your behalf

### Usage Data
- **Followed Artists**: Retrieved from your Spotify account via the API
- **Generated Playlists**: Created and managed in your Spotify account
- **Track History**: Records of which tracks have been added to prevent duplicates

## How Your Instance Uses This Data

Your TrackWatch instance uses this data to:
- Authenticate with Spotify's API on your behalf
- Display your followed artists in the application
- Check for new releases from artists you follow
- Automatically add new tracks to your TrackWatch playlist on Spotify
- Send email notifications about new releases (if configured)

## Data Storage

All data is stored in the PostgreSQL database that you configure and control:
- **Location**: Your server, your infrastructure
- **Access**: Only you (and anyone you grant access to your server)
- **Encryption**: Dependent on your server configuration
- **Backups**: Your responsibility to configure

## Third-Party Communication

Your TrackWatch instance communicates directly with:

1. **Spotify API** (`api.spotify.com`)
   - To fetch your profile, followed artists, and manage playlists
   - Subject to [Spotify's Privacy Policy](https://www.spotify.com/legal/privacy-policy/)

2. **Resend API** (optional, if configured)
   - To send email notifications
   - Subject to [Resend's Privacy Policy](https://resend.com/legal/privacy-policy)

The developer does **not** operate any servers that receive data from your instance.

## Your Control

As the operator of your own instance, you have full control:
- **Access**: View all data in your database directly
- **Modification**: Change or correct any stored data
- **Deletion**: Remove data or delete the entire database
- **Revocation**: Disconnect Spotify access at any time via [Spotify Account Settings](https://www.spotify.com/account/apps/)

## Children's Privacy

TrackWatch is not intended for users under 13 years of age, in compliance with Spotify's terms of service.

## Questions

For questions about how TrackWatch handles data, please open an issue on the [GitHub repository](https://github.com/emlopezr/trackwatch).

---

*This is a data handling statement for self-hosted software, not a privacy policy for a hosted service. You are responsible for your own data.*
