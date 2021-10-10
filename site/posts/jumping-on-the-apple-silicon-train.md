---
title: M1 MacBook Air
description: Jumping on the Apple silicon hype-train with a MacBook Air
date: 2021-09-11
---

I've been wanting to jump on the Apple Silicon hype-train ever since reading/watching reviews of how efficient and performant these <abbr title="System on a chip">SoC</abbr>s are. I planned on waiting for the next generation of MacBooks (rumored to be M1X or M2) but succumbed to tech consumerism earlier than expected. 

> Space Grey 7-Core GPU model with 16GB memory (necessary when working on huge codebases).

I'm replacing my secondhand ThinkPad X1C6 (running ArchLinux and [DWM](https://dwm.suckless.org)) that I've used for around a year. Arch is stable and works well, but I'd spend too much time chasing perfection, followed by encountering **minor** breakages every other `pacman -Syu`.

I started using macOS in the last few months on my work machine have become somewhat comfortable with the OS. It was straightforward to clone my [GNU stow](https://www.gnu.org/software/stow/) oriented dotfiles setup, change a few paths and start using the brew package manager. A few notable pieces of software have kept me sane:

- [Rectangle](https://rectangleapp.com)
- [AltTab](https://alt-tab-macos.netlify.app)

## Nix

I've gone with Nix instead of Homebrew for the same reason I adore <abbr title="Infrastructure as code">IaC</abbr>. Nix's declarative and reproducible approach to configuring a system is a major plus. 

Nix-darwin is essentially an extension to Nix for MacOS, completely optional, I find that it provides useful features such as being able to configure system settings (such as trackpad sensitivity) and manage brew packages (A package manager within another).

## Docker

Apple Silicon has native support for Docker, but Nix doesn't have a way to run the Docker daemon. It's easy enough to download and install the application in the *regular* fashion. However, I'm trying to have a completely reproducible system that has a near fully-automated setup. The Docker Foundation recently announced changes to business subscriptions, in turn, bringing to light some alternatives. 

### [Podman](https://docs.podman.io/en/latest/index.html)

I did have to install `brew` manually, but I've just dropped the lines into my `setup.sh` script. Note that on Apple Silicon, Homebrew defaults to `/opt/homebrew/` rather than the usual `/usr/local/`. Upon running `darwin-rebuild switch`, the patched QEMU and Podman are installed via `brew bundle` and available to use on my system.

```nix
homebrew = {
  enable = true;
  autoUpdate = true;
  brewPrefix = "/opt/homebrew/bin";
  taps = [
    "simnalamburt/x"
  ];
  brews = [
    "simnalamburt/x/podman-apple-silicon"
  ];
};

programs.zsh = {
  enable = true;
  loginShellInit = ''
    eval "$(/opt/homebrew/bin/brew shellenv)"
  '';
};
```

Podman worked right off the bat, running the following commands in my terminal:

```shell
podman machine init
podman machine start
podman run hello
```

Podman configures and starts a QEMU VM running Fedora CoreOS, fetches the `hello` image from Docker Hub, and runs the container inside the VM. Not much different from the way that Docker works in non-Linux operating systems. 

Since Podman has a very similar CLI to Docker's CLI, It's common to create an alias. I added the `alias docker='podman'` to my `programs.zsh.interactiveShellInit`.

I must say, it works pretty well.