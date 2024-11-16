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

    const contentEntity = new ContentEntity();
    contentEntity.guid = entityGuid;
    contentEntity.pathAndName = "test/file.txt";
    contentEntity.mimeType = "text/plain";
    contentEntity.base64Encoded = false;
    contentEntity.encodedSize = 1024;
    contentEntity.securablesGuid = entityGuid;
    contentEntity.created = new Date();
    contentEntity.createdBy = entityGuid;
    contentEntity.modified = new Date();
    contentEntity.modifiedBy = entityGuid;
    contentEntity.content = "Sample content";

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
            throw new Error("Return from login did not provide a 'data' with the token!");

        token = obj["data"] as string;
    }, Config.jestTimeoutSeconds * 1000);

    afterAll(async () => {
        try { await new ContentRepository(eds).delete({ guid: entityGuid }); }
        catch (err) { /* eat error */ }

        await eds.destroy();
    }, Config.jestTimeoutSeconds * 1000);

    test("POST /api/v0/content - save new should return 200", async () => {
        if (!token)
            throw new Error("No token - did beforeAll() fail?");

        const response = await fetch(Config.appUrl + "/api/v0/content", {
            agent: agent,
            method: "POST",
            body: JSON.stringify(contentEntity),
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
        expect(contentEntity.guid).toEqual(reloaded.guid);
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
        expect(data[0].pathAndName).toBeTruthy();
        expect(data[0].mimeType).toBeTruthy();
        expect(data[0].base64Encoded).toBeTruthy();
        expect(data[0].encodedSize).toBeTruthy();
        expect(data[0].content).toBeTruthy();
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