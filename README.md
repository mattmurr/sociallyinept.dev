# Source for [my blog](https://compti.me)

It's easy to repurpose this repository for your own AWS hosted static site, just
replace the contents of `site/` with your own.

Here's a blog post about this repository:
[https://compti.me/posts/hosting-my-static-site-with-aws/](https://compti.me/posts/hosting-my-static-site-with-aws/)

## Useful commands

- `npm run build` build static site with eleventy
- `npm run dev` eleventy development server
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk bootstrap` bootstrap the AWS environment
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
