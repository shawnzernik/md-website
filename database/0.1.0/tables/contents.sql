CREATE TABLE "contents" (
    "guid" UUID PRIMARY KEY,

    "path_and_name" VARCHAR(500) NOT NULL,
    "mime_type" VARCHAR(250) NOT NULL,
    "encoded_size" INT NOT NULL,

    "created" TIMESTAMP NOT NULL,
    "created_by" UUID NOT NULL,
    "modified" TIMESTAMP NOT NULL,
    "modified_by" UUID NOT NULL,
    "deleted" TIMESTAMP,
    "deleted_by" UUID,

    "view_uri" VARCHAR(1024) NOT NULL,
    "edit_uri" VARCHAR(1024) NOT NULL,

    "content" TEXT NOT NULL
);

ALTER TABLE "contents" ADD CONSTRAINT "uk_contents_uri" UNIQUE ("uri");