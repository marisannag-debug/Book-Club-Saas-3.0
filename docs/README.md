# Book-Club-SaaS
Aplikacja do zarządzania book klubami, na zajęcia 

## Debug endpoints

Krótka dokumentacja pomocna podczas lokalnego debugowania sesji i sprawdzania nagłówków/cookie.

- `GET /api/health` — podstawowy endpoint health, zwraca JSON `{ status: 'ok', timestamp }`.
- `POST /api/auth/session` — wysyłaj JSON `{ "email": "you@example.com" }` aby otrzymać token sesji (gdy profil istnieje).
- `GET /api/auth/session` — sprawdza nagłówek `Authorization: Bearer <token>` lub cookie `session` i zwraca obiekt sesji lub błąd 401.
- `GET /api/debug/session` — (lub `POST`) zwraca nagłówki, ciasteczka i informacje debugowe; użyteczne do sprawdzania, czy cookie o nazwie `dev_session` lub `session` dociera do serwera.

Przykłady (curl):

```bash
# Health
curl http://localhost:3000/api/health

# Request session token (server returns token when profile found)
curl -X POST -H "Content-Type: application/json" -d '{"email":"user@example.com"}' http://localhost:3000/api/auth/session

# Check session with Bearer token
curl -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/auth/session

# Debug endpoint: zobacz nagłówki i cookie
curl -X GET -H "Cookie: session=<TOKEN>" http://localhost:3000/api/debug/session
```

Bezpieczeństwo: debug endpoints nie ujawniają poufnych danych w produkcji; używaj ich tylko w środowisku deweloperskim i nie ujawniaj kluczy ani secretów.
