import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

export const createApolloClient = (uri = process.env.NEXT_PUBLIC_GRAPHQL_URL) =>
  new ApolloClient({
    link: new HttpLink({ uri }),
    cache: new InMemoryCache(),
  });
