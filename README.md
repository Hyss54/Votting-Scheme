# Awards Voting System

A comprehensive web application for managing awards nominations and voting with integrated payment processing. Built with Next.js 14, Supabase, and multiple payment gateways.

## Features

### 🎯 Three User Roles
- **Admin**: Create events, manage nominees, view reports
- **Voter**: Browse events, vote for nominees, payment integration
- **Nominee**: View real-time vote counts and statistics

### 💳 Payment Integration
- **Paystack**: Card, Mobile Money, Bank transfers
- **MTN Mobile Money**: Direct mobile money payments
- **Hubtel**: Multiple payment options

### ⚡ Real-time Features
- Live vote count updates
- Real-time event status changes
- Instant payment confirmation

### 📊 Admin Features
- Create and manage voting events
- Add nominees to positions
- Comprehensive reports with CSV export
- Revenue analytics
- Vote statistics

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payment**: Paystack, MTN MoMo, Hubtel
- **State Management**: React Hooks
- **Validation**: Zod
- **UI Components**: Custom components with Lucide icons

## Prerequisites

- Node.js 18+ and npm
- Supabase account
- Payment gateway accounts (Paystack, MTN MoMo, Hubtel)

## Installation

### 1. Clone and Install

```bash
cd /path/to/awards-voting-system
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Update the environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# MTN Mobile Money
MTN_MOMO_API_KEY=your_mtn_api_key
MTN_MOMO_API_SECRET=your_mtn_api_secret
MTN_MOMO_SUBSCRIPTION_KEY=your_mtn_subscription_key
MTN_MOMO_ENVIRONMENT=sandbox

# Hubtel
HUBTEL_CLIENT_ID=your_hubtel_client_id
HUBTEL_CLIENT_SECRET=your_hubtel_client_secret
HUBTEL_MERCHANT_NUMBER=your_hubtel_merchant_number

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

Follow the instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md) to:
1. Create Supabase project
2. Run SQL migrations
3. Set up Row Level Security (RLS)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
awards-voting-system/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   ├── (landing)/           # Landing page
│   ├── admin/               # Admin dashboard
│   ├── voter/               # Voter interface
│   ├── nominee/             # Nominee dashboard
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── admin/               # Admin components
│   ├── voter/               # Voter components
│   └── nominee/             # Nominee components
├── lib/                     # Utilities and libraries
│   ├── supabase/           # Supabase client
│   ├── payments/           # Payment integrations
│   ├── utils/              # Helper functions
│   ├── validations/        # Zod schemas
│   └── security/           # Security utilities
├── types/                   # TypeScript types
├── hooks/                   # Custom React hooks
└── public/                  # Static assets
```

## Usage

### Admin Workflow

1. **Login** as admin at `/login`
2. **Create Event** at `/admin/events/new`
3. **Add Positions** to the event
4. **Add Nominees** at `/admin/nominees`
5. **Activate Event** to start voting
6. **View Reports** at `/admin/reports`

### Voter Workflow

1. **Register/Login** at `/register` or `/login`
2. **Browse Events** at `/voter/events`
3. **Select Event** and position
4. **Vote** for nominee
5. **Complete Payment** via preferred method
6. **View History** at `/voter/history`

### Nominee Workflow

1. **Login** as nominee
2. **View Dashboard** at `/nominee/dashboard`
3. **Track Votes** in real-time

## Payment Setup

### Paystack

1. Sign up at [paystack.com](https://paystack.com)
2. Get API keys from Dashboard → Settings → API Keys
3. Set up webhook URL: `https://yourdomain.com/api/payments/webhook`

### MTN Mobile Money

1. Register at [MTN Developer Portal](https://momodeveloper.mtn.com)
2. Create subscription and get credentials
3. Configure API user and key

### Hubtel

1. Sign up at [hubtel.com](https://hubtel.com)
2. Get merchant credentials
3. Configure webhook URLs

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Follow the prompts and add environment variables in Vercel dashboard.

### Other Platforms

1. Build the project: `npm run build`
2. Set environment variables
3. Deploy the `.next` folder

## Database Schema

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for complete schema details.

**Main Tables:**
- `users` - User accounts with roles
- `events` - Voting events
- `positions` - Award positions/categories
- `nominees` - Nominees for positions
- `votes` - Vote records
- `payments` - Payment transactions

## Security Features

- Row Level Security (RLS) on all tables
- Role-based access control
- Rate limiting on API endpoints
- Payment webhook signature verification
- Input validation with Zod schemas
- CSRF protection

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Troubleshooting

### Common Issues

**Payment not processing:**
- Check API keys in environment variables
- Verify webhook URLs are correctly set
- Check payment gateway dashboard for errors

**Database errors:**
- Ensure RLS policies are set up correctly
- Verify Supabase credentials
- Check table permissions

**Build errors:**
- Clear `.next` folder and node_modules
- Run `npm install` again
- Check Node.js version (18+)

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Open an issue on GitHub
- Email: support@awardsystem.com

## Acknowledgments

- Next.js team for the amazing framework
- Supabase for backend infrastructure
- Payment gateway providers for integration support
