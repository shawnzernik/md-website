CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO "menus" ("guid", "parents_guid", "order", "display", "bootstrap_icon", "url") VALUES
('527f06a9-0378-47c6-9b16-a9c0b72c757e', 'b1e3c680-0f62-4931-8a68-4be9b4b070f7', 100, 'Contents', 'cloud-arrow-up-fill', '/static/tre/pages/lists.html?url_key=contents&Name=/');

INSERT INTO "securables" ("guid", "display_name")
SELECT 
    m.guid,
    CASE
        WHEN m.parents_guid IS NULL THEN CONCAT('Menu:', m.display)
        ELSE CONCAT(
            'Menu:Item:',
            COALESCE(
                (SELECT p.display FROM "menus" p WHERE m.parents_guid = p.guid LIMIT 1),
                'MISSING'
            ),
            ':',
            m.display
        )
    END
FROM "menus" m
WHERE 
    m.guid NOT IN ( SELECT "guid" from "securables" )