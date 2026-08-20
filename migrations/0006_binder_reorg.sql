-- Step 1: Rename binders for new organization
UPDATE binders SET name = 'Comedy & Animation', label = 'Binder 1 — Comedy & Animation' WHERE id = 2;
UPDATE binders SET name = 'Sci-Fi, Fantasy, Horror & Directors', label = 'Binder 2 — Sci-Fi, Fantasy, Horror & Directors' WHERE id = 1;
UPDATE binders SET name = 'Action, Crime & Drama', label = 'Binder 3 — Action, Crime & Drama' WHERE id = 3;

-- Step 2: Fix franchise categories (Indiana Jones, Back to the Future, Ghostbusters)
UPDATE movies SET binder_category = 'Indiana Jones' WHERE id IN (333, 334, 350, 338);
UPDATE movies SET binder_category = 'Back to the Future' WHERE id IN (39, 40, 41);
UPDATE movies SET binder_category = 'Ghostbusters' WHERE id IN (114, 115);
UPDATE movies SET binder_category = 'Eighties Classics' WHERE id = 256;

-- Step 3: Move director non-franchise movies to director categories
UPDATE movies SET binder_category = 'Steven Spielberg' WHERE id IN (69, 218);
UPDATE movies SET binder_category = 'Martin Scorsese' WHERE id = 283;

-- Step 4: Categorize the 82 uncategorized movies

-- Action
UPDATE movies SET binder_category = 'Modern Action' WHERE id IN (7, 165, 337);
UPDATE movies SET binder_category = '80s & 90s Action' WHERE id IN (58, 79, 136, 263, 298, 310);
UPDATE movies SET binder_category = 'Superhero' WHERE id IN (62, 294);
UPDATE movies SET binder_category = 'Rocky' WHERE id IN (264, 265, 212);

-- Adventure
UPDATE movies SET binder_category = 'Eighties Classics' WHERE id = 330;

-- Animation
UPDATE movies SET binder_category = 'Other Animation' WHERE id = 106;
UPDATE movies SET binder_category = 'Disney' WHERE id = 160;

-- Comedy
UPDATE movies SET binder_category = '2000s Comedy' WHERE id IN (38, 59, 108, 132, 137, 138, 157, 167, 277, 303, 316, 319, 329);
UPDATE movies SET binder_category = '90s Comedy' WHERE id IN (13, 14, 80, 255);
UPDATE movies SET binder_category = '80s Comedy' WHERE id IN (331, 332);
UPDATE movies SET binder_category = 'Classic Comedy' WHERE id IN (23, 172);
UPDATE movies SET binder_category = 'Dark Comedy' WHERE id = 33;
UPDATE movies SET binder_category = 'Georgia' WHERE id = 42;

-- Crime
UPDATE movies SET binder_category = 'Big Crime' WHERE id IN (21, 82, 92, 174, 179);
UPDATE movies SET binder_category = 'David Fincher' WHERE id = 268;
UPDATE movies SET binder_category = 'Cinema Classic' WHERE id = 288;

-- Drama
UPDATE movies SET binder_category = 'TNT Drama' WHERE id IN (31, 54, 74, 139, 296);
UPDATE movies SET binder_category = 'Cinema Classic' WHERE id IN (118, 178);
UPDATE movies SET binder_category = 'Financial Movie' WHERE id IN (170, 321);
UPDATE movies SET binder_category = 'Music' WHERE id = 76;
UPDATE movies SET binder_category = 'Modern Drama' WHERE id = 30;
UPDATE movies SET binder_category = 'Sports Drama' WHERE id = 100;

-- Fantasy
UPDATE movies SET binder_category = 'Harry Potter' WHERE id IN (102, 103);
UPDATE movies SET binder_category = 'Fantasy' WHERE id IN (291, 299);

-- Horror
UPDATE movies SET binder_category = 'Modern Horror' WHERE id IN (75, 217, 227);
UPDATE movies SET binder_category = 'Creature Horror' WHERE id = 26;
UPDATE movies SET binder_category = 'Cult Horror' WHERE id = 110;

-- Sci-Fi
UPDATE movies SET binder_category = 'Mindfuck' WHERE id IN (336, 164, 318);
UPDATE movies SET binder_category = 'Modern Sci-Fi' WHERE id IN (29, 317);
UPDATE movies SET binder_category = '80s & 90s Sci-Fi' WHERE id IN (72, 89, 209, 210);

-- War
UPDATE movies SET binder_category = 'War' WHERE id IN (1, 162, 257);

-- Step 5: Reassign ALL owned movies to correct binders
-- Directors go to Binder 1 (id=1)
UPDATE movies SET binder_id = 1 WHERE status = 'owned'
  AND binder_category IN ('Christopher Nolan', 'Stanley Kubrick', 'Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese');

-- Comedy, Animation, Adventure → Binder 2 (id=2)
UPDATE movies SET binder_id = 2 WHERE status = 'owned'
  AND genre IN ('Comedy', 'Animation', 'Adventure')
  AND binder_category NOT IN ('Christopher Nolan', 'Stanley Kubrick', 'Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese');

-- Sci-Fi, Fantasy, Horror, Thriller → Binder 1 (id=1)
UPDATE movies SET binder_id = 1 WHERE status = 'owned'
  AND genre IN ('Sci-Fi', 'Fantasy', 'Horror', 'Thriller')
  AND binder_category NOT IN ('Christopher Nolan', 'Stanley Kubrick', 'Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese');

-- Action, Crime, Drama, War, Documentary, Western → Binder 3 (id=3)
UPDATE movies SET binder_id = 3 WHERE status = 'owned'
  AND genre IN ('Action', 'Crime', 'Drama', 'War', 'Documentary', 'Western')
  AND binder_category NOT IN ('Christopher Nolan', 'Stanley Kubrick', 'Steven Spielberg', 'Quentin Tarantino', 'Martin Scorsese');
