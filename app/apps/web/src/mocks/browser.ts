import { setupWorker } from 'msw';
import { graphql } from 'msw';

export const worker = setupWorker(
  graphql.query('me', (req, res, ctx) => res(ctx.data({ me: { id: 'u-1', email: 'alice@example.com', name: 'Alice' } }))),
  graphql.query('clubs', (req, res, ctx) => res(ctx.data({ clubs: [] }))),
  graphql.mutation('createClub', (req, res, ctx) => {
    const { name } = req.variables;
    return res(ctx.data({ createClub: { id: 'c-1', name, ownerId: 'u-1' } }));
  })
);

// in development, import and start the worker in _app.tsx or a startup script
