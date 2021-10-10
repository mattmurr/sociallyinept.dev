---
title: Simple password-store MacOS workflow
description: How I integrate password-store with my MacOS workflow
date: 2021-09-13
---

It's the 21st century, one of the most popular internet age security tips I hear is to use a password manager, followed up with popular recommendations like 1Password, LastPass and Bitwarden. I use [`pass`](https://www.passwordstore.org).

When I used ArchLinux, I would use `passmenu` to quickly select a password that would get copied into the clipboard through `dmenu`, convenient... I want the same functionality on my new Mac, but I could only find Alfred integrations. It should be easy to do this in a <abbr title="Keep it stupid simple">KISS</abbr> way, so I wrote a quick shell script that searches my `~/.password-store` or `PASSWORD_STORE_DIR` (if set) dir and pipes into `FZF`.

```bash
#!/usr/bin/env bash

pushd "${PASSWORD_STORE_DIR:-$HOME/.password-store}"
PASSFILE=`fd -t file -e gpg --color=always | sed 's/\.gpg//; s/^\.\///' | fzf --ansi`
popd

[ -z "$PASSFILE" ] && exit 0

pass -c $PASSFILE 1>/dev/null
```

### Keyboard shortcut

Although initially sceptical due to the terrible name, [iCanHazShortcut](https://github.com/deseven/iCanHazShortcut) lets you map shortcuts to shell commands. In my case, <kbd>Command</kbd> + <kbd>P</kbd> runs `alacritty -e sh -c '~/bin/fzf-passmenu'`, launches a Terminal window with my script running. As part of my newfound Nix adventure, I'd like to turn this script into a package.
