import https from "https";
import fetch from "node-fetch";
import { MarkdownDto } from "common/src/app/models/MarkdownDto";
import { Config } from "../../../Config";
import { EntitiesDataSource } from "../../data/EntitiesDataSource";
import { MarkdownEntity } from "../../data/MarkdownEntity";
import { MarkdownRepository } from "../../data/MarkdownRepository";

jest.setTimeout(Config.jestTimeoutSeconds * 1000);

describe("MarkdownService", () => {
    let agent = new https.Agent({ rejectUnauthorized: false });
    let entityGuid = "b1234567-1234-5678-1234-567812345678";
    let token: string | undefined;
    let eds: EntitiesDataSource;

    beforeAll(async () => {
        eds = new EntitiesDataSource();
        await eds.initialize();

        const body = JSON.stringify({
            emailAddress: "administrator@localhost",
            password: "Welcome123"
        });

        const response = await fetch(Config.appUrl + "/api/v0/auth/login", {
            agent: agent,
            method: "POST",
            body: body,
            headers: { "Content-Type": "application/json" }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        if (!obj["data"])
            throw new Error("Return from login did not provide a \"data\" with the token!");

        token = obj["data"] as string;
    }, Config.jestTimeoutSeconds * 1000);

    afterAll(async () => {
        try { await new MarkdownRepository(eds).delete({ guid: entityGuid }); }
        finally { await eds.destroy(); }
    }, Config.jestTimeoutSeconds * 1000);

    test("POST /api/v0/markdown - save new should return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const entity = new MarkdownEntity();
        entity.guid = entityGuid;
        entity.title = "Test Markdown";
        entity.menusGuid = "e743cd3e-1234-5678-1234-567812345678";
        entity.bootstrapIcon = "icon-test";
        entity.uri = "/test-markdown";
        entity.content = "This is a test markdown content.";

        const response = await fetch(Config.appUrl + "/api/v0/markdown", {
            agent: agent,
            method: "POST",
            body: JSON.stringify(entity),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        let reloaded = await new MarkdownRepository(eds).findOneByOrFail({ guid: entityGuid });
        expect(entity.title).toEqual(reloaded.title);
    }, Config.jestTimeoutSeconds * 1000);

    test("POST /api/v0/markdown overwrite should return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const entity = new MarkdownEntity();
        entity.guid = entityGuid;
        entity.title = "Test Markdown Updated";
        entity.menusGuid = "e743cd3e-1234-5678-1234-567812345678";
        entity.bootstrapIcon = "icon-test-updated";
        entity.uri = "/test-markdown-updated";
        entity.content = "This is updated markdown content.";

        const response = await fetch(Config.appUrl + "/api/v0/markdown", {
            agent: agent,
            method: "POST",
            body: JSON.stringify(entity),
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        let reloaded = await new MarkdownRepository(eds).findOneByOrFail({ guid: entityGuid });
        expect(entity.title).toEqual(reloaded.title);
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/markdowns should return markdown list", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/markdowns", {
            agent: agent,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        if (!obj["data"])
            throw new Error("No data returned!");

        const data = obj["data"] as MarkdownDto[];

        expect(data.length > 0).toBeTruthy();
        expect(data[0].guid).toBeTruthy();
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/markdown/:guid should return markdown and 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/markdown/" + entityGuid, {
            agent: agent,
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        if (!obj["data"])
            throw new Error("No data returned!");

        const data = obj["data"] as MarkdownDto;

        expect(data.guid).toEqual(entityGuid);
    }, Config.jestTimeoutSeconds * 1000);

    test("DELETE /api/v0/markdown/:guid should delete markdown and return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/markdown/" + entityGuid, {
            agent: agent,
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const obj = await response.json();
        if (!response.ok)
            throw new Error(`Response: ${response.status} - ${response.statusText} - ${obj.error}`);

        expect(response.ok).toBeTruthy();
        expect(response.status).toBe(200);

        let entity = await new MarkdownRepository(eds).findBy({ guid: entityGuid });
        expect(entity.length).toEqual(0);
    }, Config.jestTimeoutSeconds * 1000);
});