BEGIN;

WITH ranked_members AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY club_id, user_id
      ORDER BY
        CASE membership_status
          WHEN 'active' THEN 3
          WHEN 'pending' THEN 2
          WHEN 'left' THEN 1
          ELSE 0
        END DESC,
        COALESCE(updated_at, joined_at) DESC,
        joined_at DESC,
        id DESC
    ) AS row_number
  FROM club_members
)
DELETE FROM club_members
WHERE id IN (
  SELECT id
  FROM ranked_members
  WHERE row_number > 1
);

DROP INDEX IF EXISTS club_members_club_user_unique_idx;

CREATE UNIQUE INDEX club_members_club_user_unique_idx
  ON club_members (club_id, user_id);

COMMIT;