-- Add new columns for split data model
ALTER TABLE movies ADD COLUMN wishlist_priority TEXT;
ALTER TABLE movies ADD COLUMN preferred_format TEXT;

-- Migrate priority from status field
UPDATE movies SET wishlist_priority = 'Buy Next' WHERE status = '2 - Buy Next';
UPDATE movies SET wishlist_priority = 'High' WHERE status = '2 - High';
UPDATE movies SET wishlist_priority = 'Medium' WHERE status = '3 - Medium';
UPDATE movies SET wishlist_priority = 'Low' WHERE status = '4 - Low';
UPDATE movies SET wishlist_priority = 'Skip' WHERE status = '5 - Skip';

-- Simplify status to owned/wishlist
UPDATE movies SET status = 'owned' WHERE status IN ('1 - Owned', '1 - Shipped');
UPDATE movies SET status = 'wishlist' WHERE status IN ('2 - Buy Next', '2 - High', '3 - Medium', '4 - Low', '5 - Skip');