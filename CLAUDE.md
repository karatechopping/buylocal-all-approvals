# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React/TypeScript approval management system for Buy Local NZ, built with Vite and deployed on Netlify. The application provides two main approval workflows:

1. **Social Media Approvals**: Review and approve social media posts stored in Airtable
2. **Featured Upgrade Approvals**: Multi-stage approval workflow for featured business listings using GoHighLevel CRM

## Development Commands

```bash
# Development server
npm run dev

# Build for production  
npm run build

# Lint code
npm run lint

# Preview production build
npm run preview

# Local development with Netlify functions
npm run netlify:dev

# Offline development
npm run netlify:serve
```

## Featured Listings Approval Criteria

**To appear in Featured Approval Set (Pending Review):**
- Must have `featured_upgrade_date` (indicates purchased upgrade)
- Must have `featured_upgrade_delivered` field present 
- `featured_upgrade_delivered` ≠ "Yes" (keeps in pending state)

**To move to DONE status:**
- Set `featured_upgrade_delivered` = "Yes" (final approval gate)

**Contact Filtering Implementation:**
- Backend: `netlify/functions/fetch-featured-contacts.ts:84-93` filters GoHighLevel contacts with both required fields
- Frontend: `src/components/FeaturedClientSelector.tsx:33-34` categorizes contacts based on `featuredUpgradeDelivered` value
- Pending Review: All contacts where `featuredUpgradeDelivered` ≠ "Yes" 
- Done: Contacts where `featuredUpgradeDelivered` === "Yes" (exact match)

**Multi-stage Content Review Process:**
1. **Profile Status**: Discovery Complete → Audit & Profile Complete → Blog/Video/Social Ready → Everything Complete
2. **Content Review**: Blog Article/Image, Video Script/Promo, Social Media (each with Approved/Re-Do approval fields)
3. **Final Delivery**: Profile URL, Audit Report, Delivery Page (each with approval workflow)

## Architecture

**Frontend**: React 18 + TypeScript + Tailwind CSS
- `src/App.tsx`: Main application with dual-mode routing (social/featured)
- `src/components/`: Reusable UI components
- `src/utils/fieldDefinitions.ts`: Field configuration management

**Backend**: Netlify Functions
- `netlify/functions/fetch-featured-contacts.ts`: GoHighLevel CRM integration
- `netlify/functions/fetch-featured-client-profile.ts`: Individual client data
- `netlify/functions/update-ghl-record.ts`: CRM record updates
- `src/airtable.ts`: Airtable API integration for social media posts

**Configuration**:
- `customfields/customfields.csv`: Field definitions with approval values
- `customfields/SectionOrder.csv`: UI section organization and priority

## Key Integrations

**GoHighLevel CRM**: Featured upgrade workflow
- Custom fields track approval stages
- Real-time updates via REST API
- Structured approval workflow with paired content/approval fields

**Airtable**: Social media post management
- Controls table defines client configurations
- Individual client bases store posts with "Check"/"Approved" status
- Image URLs stored for review interface

## Authentication & Security

- Password protection via `components/PasswordProtection.tsx`
- Session-based authentication with bcrypt password hashing
- Environment variables for API credentials
- CORS configured for Netlify deployment

## Deployment

Netlify deployment with:
- Build command: `npm run build`
- Publish directory: `dist`
- Functions directory: `netlify/functions`
- SPA routing via redirects configuration