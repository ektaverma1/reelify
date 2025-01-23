## Introduction

Reelify - [TODO]

## Deploy

Easily deploy the template to Vercel with the button below. You will need to set the required environment variables in the Vercel dashboard.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fclerk%2Fnextjs-auth-starter-template&env=CLERK_SECRET_KEY,NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY&envDescription=Your%20Clerk%20application%20keys%2C%20accessible%20from%20dashboard.clerk.com.&envLink=https%3A%2F%2Fgithub.com%2Fclerk%2Fnextjs-auth-starter-template%3Ftab%3Dreadme-ov-file%23running-the-template&demo-url=https%3A%2F%2Fnextjs-auth-starter-template-kit.vercel.app%2F)

## Running on localhost

```bash
git clone repo_url
```

To run the example locally, you need to:

1. Sign up for a Clerk account at [https://clerk.com](https://go.clerk.com/31bREJU).
2. Go to the [Clerk dashboard](https://go.clerk.com/4I5LXFj) and create an application.
3. Set the required Clerk environment variables as shown in [the example `env` file](./.env.example).
4. Go to "Organization Settings" in your sidebar and enable Organizations
5. `npm install` the required dependencies.
6. `npm run dev` to launch the development server.
