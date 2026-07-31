# Railway CLI Guide (Git Bash / Windows)

This guide provides step-by-step instructions for installing the Railway CLI via Git Bash, downloading files from your Railway volume, and completely uninstalling the CLI when you're done.

## 1. Installation

If `npm` installation fails on Windows, use the official curl script in Git Bash.

1. Open **Git Bash**.
2. Run the installation script:
   ```bash
   curl -fsSL agents.railway.com | sh
   ```
3. Once the installation is complete, activate it in your current terminal session by running:
   ```bash
   source "$HOME/.railway/env"
   ```

## 2. Authentication & Linking

Before you can download files, you must log in and link your local project.

1. **Log in:**
   ```bash
   railway login
   ```
   *(This will open a browser window to authenticate).*
2. **Move into your project folder:**
   ```bash
   cd ~/Downloads/id.ieeesbcectl.in
   ```
3. **Link your project:**
   ```bash
   railway link
   ```
   *(Use your arrow keys to select your project and backend service).*

## 3. Downloading from a Volume

If you need to download a file from a persistent volume (like an SQLite database), you must first ensure you have a local SSH key, as the CLI uses an SSH tunnel to securely transfer files.

### Step 3a: Generate an SSH Key
If you don't already have an SSH key, generate a default one by running:
```bash
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

### Step 3b: Download the File
Git Bash has a quirk where it automatically translates paths starting with `/` into local Windows paths. To prevent this and successfully download your file from the remote volume root, prepend `MSYS_NO_PATHCONV=1` to the command.

To download `database.db` from the root of the volume to your local `backend` folder:
```bash
MSYS_NO_PATHCONV=1 railway volume files download /database.db ./backend/database.db
```

## 4. Uninstallation & Cleanup

When you are completely done and want to clean up your system, run these commands in Git Bash:

1. **Log out of Railway:**
   ```bash
   railway logout
   ```
2. **Delete the SSH keys we generated:**
   ```bash
   rm ~/.ssh/id_rsa ~/.ssh/id_rsa.pub
   ```
3. **Uninstall the Railway CLI completely:**
   *(The installation script placed everything in a hidden `.railway` folder in your user directory. Deleting it completely removes the CLI).*
   ```bash
   rm -rf ~/.railway
   ```
4. **(Optional) Clean up your Bash profile:**
   The installation script added a single line to your `~/.bashrc` file. You can safely ignore it, or remove it by opening the file in Notepad:
   ```bash
   notepad ~/.bashrc
   ```
   Find the line that says `source "$HOME/.railway/env"`, delete it, and save the file.
