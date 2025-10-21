import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: [
    '/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|assets|public|.*\\.(?:png|jpg|jpeg|svg|gif|ico|webp|css|js|map)$).*)',
  ],
  runtime: 'nodejs',
};