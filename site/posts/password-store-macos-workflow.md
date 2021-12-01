---
title: Simple password-store MacOS workflow
description: Integrate password-store with MacOS with fzf-passmenu
date: 2021-12-01
---

It's the 21st century, one of the most popular internet age security tips I hear is to use a password manager, followed up with popular recommendations like 1Password, LastPass and Bitwarden. I use [`pass`](https://www.passwordstore.org).

On <span title="I use Arch btw">Arch Linux</span>, [`passmenu`](https://git.zx2c4.com/password-store/tree/contrib/dmenu/passmenu) was the perfect tool to pick a password to be copied to my clipboard, convenient... I want the same functionality in MacOS. I whipped up a simple shell script that finds `.gpg` files in `~/.password-store` or `PASSWORD_STORE_DIR` (if set) and pipes into [`fzf`](https://https://github.com/junegunn/fzf):

<details>
<summary><a href="https://git.sr.ht/~thickrocks/scripts/tree/master/item/fzf-passmenu"><code>~/bin/fzf-passmenu</code></a></summary>

```bash
#!/usr/bin/env bash

pushd "${PASSWORD_STORE_DIR:-$HOME/.password-store}"
PASSFILE=`fd -t file -e gpg --color=always | sed 's/\.gpg//; s/^\.\///' | fzf --ansi`
popd

[ -z "$PASSFILE" ] && exit 0

pass -c $PASSFILE 1>/dev/null
```

</details>

### Keyboard shortcut

Although I was initially sceptical due to the name, [iCanHazShortcut](https://github.com/deseven/iCanHazShortcut) allows you to map shortcuts to shell commands; <kbd>Command</kbd> + <kbd>P</kbd> runs `alacritty -e sh -c '~/bin/fzf-passmenu'`, spawning a new terminal window and executing the script.
