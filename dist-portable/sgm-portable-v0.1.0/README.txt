# SGM Portable - Version 0.1.0

## Privacy-First Sales Governance Management

This is a portable, standalone version of SGM that runs entirely on your local machine.
No cloud services, no external dependencies - your data stays with you.

## Quick Start

### Windows
1. Double-click `START_SGM.bat`
2. Your browser will open to http://localhost:3003
3. Start managing your compensation plans!

### macOS / Linux
1. Open Terminal in this directory
2. Run: `./start.sh`
3. Your browser will open to http://localhost:3003

## Data Location

All your data is stored in the `data/` folder:
- **data/sgm.db** - SQLite database with all your metadata
- **data/documents/** - Your document files
- **data/plans/** - Your plan files

**Backup:** Simply copy the entire `data/` folder to backup your data.

## System Requirements

- **Node.js:** Version 20 or higher (download from https://nodejs.org)
- **Operating System:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 2GB minimum, 4GB recommended
- **Disk Space:** 500MB for application + space for your documents
- **Port:** 3003 must be available (or change PORT in start script)

## Features

- ✅ **100% Local** - All data stays on your machine
- ✅ **No Installation** - Just unzip and run
- ✅ **Portable** - Run from USB drive or any folder
- ✅ **Privacy-First** - No analytics, no telemetry, no cloud
- ✅ **Offline** - Works without internet connection

## Troubleshooting

### "Port 3003 already in use"
Edit the start script and change `PORT=3003` to another number (e.g., 3004)

### "Permission denied" (Mac/Linux)
Run: `chmod +x start.sh` then try again

### Database locked
Make sure only one instance of SGM is running

### Browser doesn't open automatically
Manually open: http://localhost:3003

## Security

- All data is stored locally in SQLite database
- No internet connection required
- No data sent to external services
- You control all backups and data retention

## Support

- Documentation: https://docs.sgm.com
- Issues: https://github.com/bhg/sgm/issues
- Email: support@sgm.com

## License

© 2026 BHG Analytics. All rights reserved.

---

**SGM Portable v0.1.0**
Built: 2026-01-07T21:00:33.735Z
