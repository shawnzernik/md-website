CREATE TABLE "contents" (
    "guid" UUID PRIMARY KEY,

    "path_and_name" VARCHAR(500) NOT NULL UNIQUE,
    "mime_type" VARCHAR(250) NOT NULL,
    "encoded_size" INT NOT NULL,

    "created" TIMESTAMP NOT NULL,
    "created_by" UUID NOT NULL,
    "modified" TIMESTAMP NOT NULL,
    "modified_by" UUID NOT NULL,
    "deleted" TIMESTAMP,
    "deleted_by" UUID,

    "content" TEXT NOT NULL
);
