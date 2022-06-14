---
title: Start Contributing
description: How to begin and/or encourage contributing
date: 2022-06-04
draft: true
---

I'm a self-taught developer and managed to land my first tech job just over a
year ago. Prior, I was stuck in an endless cycle of not knowing if I'm good
enough (looking back, this was probably Imposters Syndrome). It wasn't until I
managed to join a training programme offered by
[Generation UK](https://uk.generation.org/), that I realized that, I'm good
enough to be doing this. One of the best ways to progress, is to just get stuck
in.

Software, like many other things are often best built through collaboration,
good ol' teamwork. Of course, you can produce great software as a lone wolf, and
there is nothing wrong with that, but it's likely that a lot of the time, you
are not going to be the only person working on a codebase; together with others,
you will be contributing code that delivers value towards a larger goal.

One of the things I struggled with the most in the past few years, before and
after landing my first tech job, is mustering up the courage to put my work on
show. I want to lay out my retrospective thoughts on what helped me to push past
this hurdle.

## Contributors

Contributing to projects often requires a certain level of knowledge on the
technology and code-base; on top of this, you have to go through the often
rigorous code review pretty daunting for a beginner.

Here are some tips:

1. Keep your changes minimal
   - Make sure your changes stay within the scope of the issue
   - Find the simplest implementation
     ([KISS](https://en.wikipedia.org/wiki/KISS_principle))
2. Ask a buddy to review your changes, before you create the pull request
3. Make sure you follow the project's formatting and linting rules (, even if
   you don't agree with them)
4. Endeavor to write tests that cover all conditions of your logic, in-fact I
   strongly encourage [test-driven development]() in some scenarios, an act of
   writing your tests before you write logic.

## Maintainers

Project maintainers, you can encourage contribution; please try your best to
ensure issues are somewhat refined, tag/label tickets and suggest steps to solve
the issue, enable potential contributors to start hacking away.

Documentation is a must! Whether GitHub Wiki or Confluence, aim that everybody
can understand your project at a high-level; and those that are tech-literate
should be able to delve deeper just from reading your docs. There is no excuse,
Modern programming languages are building great tooling around documentation,
Rust's [docs.rs](https://docs.rs/about) for example.

Tests are also a form of documentation, but I wouldn't solely rely on that, I
think it's best positioned to supplement existing documentation. Your testing
suite should be able to catch any regressions from contributions and serve as
proof that (in theory) your software works as intended. A passing test suite for a
contributor grants confidence, and that confidence improves the likelihood that
a PR will be raised.

## Conclude

Developers and maintainers alike must collaborate to contribute and visa versa, contribute to collaborate, seems a strange thing to say right? But think about it. 

1. Do not be afraid
2. Advocate to improve the process for potential contributors
3. Keep it stupid simple
4. Communicate