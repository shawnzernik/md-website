CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

INSERT INTO "menus" ("guid", "parents_guid", "order", "display", "bootstrap_icon", "url") VALUES
('3ad2bf67-2b90-4d54-8314-224e5d624cd1', NULL, 4435, 'Markdown', 'file-earmark-text', ''),
('527f06a9-0378-47c6-9b16-a9c0b72c757e', '3ad2bf67-2b90-4d54-8314-224e5d624cd1', 1, 'Contents', 'cloud-arrow-up', '/static/tre/pages/list.html?url_key=contents&folder=/'),
('40af55a5-db9e-4adf-8f4b-b30cf568b502', '3ad2bf67-2b90-4d54-8314-224e5d624cd1', 2, 'Markdowns', 'file-earmark-richtext', '/static/tre/pages/list.html?url_key=markdowns&folder=/');

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