# Salt Route

Salt Route is a full-stack hospitality platform for curated stays in Nepal. It combines the public marketing and booking experience with guest, property-owner, and administrator portals.

## What is included

- Public property discovery, maps, availability, wishlists, enquiries, and booking requests
- Guest account, booking, review, message, and notification flows
- Owner property, booking, reporting, profile, and message workflows
- Admin operations for properties, bookings, owners, guests, reviews, campaigns, reporting, and settings
- Transactional email templates and an optional Redis-backed campaign worker
- Optional Groq/OpenRouter features for the concierge and admin content tools

## Technology

- Next.js 16 and React 19
- TypeScript and Tailwind CSS 4
- PostgreSQL with Prisma 7
- NextAuth 5
- Cloudinary, Nodemailer, BullMQ, and Redis
- Vitest and Playwright

## Requirements

- Node.js 20.9 or newer
- pnpm 10
- PostgreSQL
- SMTP credentials for production email
- Cloudinary for media uploads
- Redis only when background campaign processing is enabled

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Copy `.env.example` to `.env.local` and replace the placeholders. Never commit `.env.local` or send production credentials with the source code.

3. Generate the Prisma client and apply the committed migrations:

   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

4. Start the application:

   ```bash
   pnpm dev
   ```

   The site is available at [http://localhost:3000](http://localhost:3000).

5. If email campaigns use Redis, start the worker in a separate process:

   ```bash
   pnpm worker
   ```

## Quality checks

Run the complete local verification suite:

```bash
pnpm check
pnpm build
```

End-to-end tests require the configured Playwright environment:

```bash
pnpm test:e2e
```

## Project structure

```text
app/             Next.js routes, layouts, API endpoints, and server actions
components/      Public, guest, owner, admin, booking, shared, and UI components
emails/          Transactional and campaign email templates
lib/             Domain services, integrations, validation, security, and utilities
prisma/          Database schema and committed migrations
public/
  brand/         Brand assets
  images/
    marketing/   Public marketing imagery
    testimonials/Guest and partner testimonial imagery
scripts/         Runtime worker entry points
__tests__/       Unit and regression tests
e2e/             Playwright browser tests
types/           Shared TypeScript declarations
```

## Production deployment

1. Provision PostgreSQL and set all required environment variables from `.env.example` in the hosting platform.
2. Run `pnpm db:migrate` against the production database before the new application version receives traffic.
3. Build with `pnpm build` and run with `pnpm start`.
4. Deploy `pnpm worker` as a separate long-running process when Redis-backed campaigns are enabled.
5. Confirm the authentication callback URL, Cloudinary upload settings, SMTP sender, and public site URL use the production domain.

The AI keys are optional. The application keeps its core booking and portal flows when they are unset, while AI-assisted concierge and copy features are unavailable.
