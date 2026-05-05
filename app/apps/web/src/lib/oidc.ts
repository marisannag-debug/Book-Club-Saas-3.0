import { createAuth } from 'react-oidc-context';

export const oidcConfig = {
  authority: process.env.NEXT_PUBLIC_OIDC_ISSUER,
  client_id: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
  redirect_uri: typeof window !== 'undefined' ? window.location.origin + '/callback' : undefined,
};

export const auth = createAuth(oidcConfig);
