import https from "https";
import fetch from "node-fetch";
import { ContentDto } from "common/src/app/models/ContentDto";
import { Config } from "../../../Config";
import { EntitiesDataSource } from "../../data/EntitiesDataSource";
import { ContentEntity } from "../../data/ContentEntity";
import { ContentRepository } from "../../data/ContentRepository";

jest.setTimeout(Config.jestTimeoutSeconds * 1000);

describe("ContentService", () => {
    let agent = new https.Agent({ rejectUnauthorized: false });
    let entityGuid = "faf76b3d-ed66-4182-a7c2-7ea6562785fe";
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
        try { await new ContentRepository(eds).delete({ guid: entityGuid }); }
        finally { await eds.destroy(); }
    }, Config.jestTimeoutSeconds * 1000);

    test("POST /api/v0/content - save new should return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const entity = new ContentEntity();
        entity.guid = entityGuid;
        entity.pathAndName = "test/content/path";
        entity.mimeType = "application/json";
        entity.created = new Date();
        entity.createdBy = "administrator@localhost";
        entity.modified = new Date();
        entity.modifiedBy = "administrator@localhost";
        entity.viewUri = "http://localhost/view";
        entity.editUri = "http://localhost/edit";
        entity.content = "{}";

        const response = await fetch(Config.appUrl + "/api/v0/content", {
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

        let reloaded = await new ContentRepository(eds).findOneByOrFail({ guid: entityGuid });
        expect(entity.pathAndName).toEqual(reloaded.pathAndName);
    }, Config.jestTimeoutSeconds * 1000);

    test("POST /api/v0/content overwrite should return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const entity = new ContentEntity();
        entity.guid = entityGuid;
        entity.pathAndName = "test/content/path/dup";
        entity.mimeType = "application/json";
        entity.created = new Date();
        entity.createdBy = "administrator@localhost";
        entity.modified = new Date();
        entity.modifiedBy = "administrator@localhost";
        entity.viewUri = "http://localhost/view";
        entity.editUri = "http://localhost/edit";
        entity.content = "{}";

        const response = await fetch(Config.appUrl + "/api/v0/content", {
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

        let reloaded = await new ContentRepository(eds).findOneByOrFail({ guid: entityGuid });
        expect(entity.pathAndName).toEqual(reloaded.pathAndName);
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/contents should return content list", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/contents", {
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

        const data = obj["data"] as ContentDto[];

        expect(data.length > 0).toBeTruthy();
        expect(data[0].guid).toBeTruthy();
    }, Config.jestTimeoutSeconds * 1000);

    test("GET /api/v0/content/:guid should return content and 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/content/" + entityGuid, {
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

        const data = obj["data"] as ContentDto;

        expect(data.guid).toEqual(entityGuid);
    }, Config.jestTimeoutSeconds * 1000);

    test("DELETE /api/v0/content/:guid should delete content and return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/content/" + entityGuid, {
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

        let entity = await new ContentRepository(eds).findBy({ guid: entityGuid });
        expect(entity.length).toEqual(0);
    }, Config.jestTimeoutSeconds * 1000);
});