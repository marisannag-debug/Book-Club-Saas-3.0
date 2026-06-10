BEGIN;

DROP POLICY IF EXISTS allow_owner_or_host_delete_book_proposals ON book_proposals;
DROP POLICY IF EXISTS allow_owner_or_host_update_book_proposals ON book_proposals;
DROP POLICY IF EXISTS allow_member_create_book_proposals ON book_proposals;
DROP POLICY IF EXISTS allow_member_read_book_proposals ON book_proposals;

DROP TRIGGER IF EXISTS book_proposals_updated_at_trigger ON book_proposals;
DROP FUNCTION IF EXISTS update_book_proposals_updated_at();

DROP INDEX IF EXISTS book_proposals_club_created_at_idx;
DROP INDEX IF EXISTS book_proposals_club_created_by_idx;

DROP TABLE IF EXISTS book_proposals;

COMMIT;
