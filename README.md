# Studio Configurator

Production-ready Next.js 14 starter for a 3D furniture configurator using the App Router, TailwindCSS, React Three Fiber, Drei, Supabase, and SendGrid.

## Stack

- Next.js 14
- React 18
- TailwindCSS
- React Three Fiber + Drei
- Supabase
- SendGrid
- TypeScript

## Project Structure

```text
app/
components/
  Viewer/
  CustomizationPanel/
  ProductSelector/
  SavedDesigns/
lib/
  supabase/
  utils/
services/
  email/
api/
  save-design.ts
  get-designs.ts
  submit-request.ts
public/
  models/
  textures/
```

## Environment Variables

Copy `.env.example` to `.env.local` and provide:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`
- `SENDGRID_TO_EMAIL`

## Suggested Supabase Tables

`furniture_designs`

- `id uuid primary key`
- `name text`
- `product_type text`
- `color text`
- `upholstery text`
- `leg_finish text`
- `notes text`
- `created_at timestamptz`

`customer_requests`

- `id bigint generated always as identity primary key`
- `full_name text`
- `email text`
- `company text`
- `message text`
- `design_name text`
- `product_type text`
- `created_at timestamptz`

## Local Development

```bash
npm install
npm run dev
```

## Vercel Deployment

1. Import the repository into Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy using the default Next.js build settings.

The project is already structured for Vercel with App Router API routes under `app/api`.
