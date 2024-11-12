CREATE TABLE "contents" (
	"guid" UUID PRIMARY KEY,
	"uri" VARCHAR(250) NOT NULL,
    "content" TEXT NOT NULL
);

ALTER TABLE "contents" ADD CONSTRAINT "uk_contents_uri" UNIQUE ("uri");