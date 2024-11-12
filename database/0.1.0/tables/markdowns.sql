CREATE TABLE "markdowns" (
    "guid" UUID PRIMARY KEY,

    "title" VARCHAR(100) NOT NULL,
    "menus_guid" UUID NOT NULL,
    "bootstrap_icon" VARCHAR(100) NOT NULL,
    "uri" VARCHAR(250) NOT NULL,
    "content" TEXT NOT NULL
);

ALTER TABLE "markdowns" ADD CONSTRAINT "uk_markdowns_title_menus_guid" UNIQUE ("menus_guid", "title");
ALTER TABLE "markdowns" ADD CONSTRAINT "uk_markdowns_uri" UNIQUE ("uri");