-- rollback for 000_init_users.sql
BEGIN;
DROP TABLE IF EXISTS users;
COMMIT;
