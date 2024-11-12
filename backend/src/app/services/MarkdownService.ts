import express from "express";
import { EntitiesDataSource } from "../data/EntitiesDataSource";
import { MarkdownDto } from "common/src/app/models/MarkdownDto";
import { MarkdownEntity } from "../data/MarkdownEntity";
import { MarkdownRepository } from "../data/MarkdownRepository";
import { Logger } from "../../tre/Logger";
import { BaseService } from "../../tre/services/BaseService";

export class MarkdownService extends BaseService {
    protected constructDataSource(): EntitiesDataSource {
        return new EntitiesDataSource();
    }

    public constructor(logger: Logger, app: express.Express) {
        super();

        logger.trace();

        app.get("/api/v0/markdown/:guid", (req, resp) => { this.methodWrapper(req, resp, this.getGuid) });
        app.get("/api/v0/markdowns", (req, resp) => { this.methodWrapper(req, resp, this.getList) });
        app.post("/api/v0/markdown", (req, resp) => { this.methodWrapper(req, resp, this.postSave) });
        app.delete("/api/v0/markdown/:guid", (req, resp) => { this.methodWrapper(req, resp, this.deleteGuid) });
    }

    public async getGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<MarkdownDto | null> {
        await logger.trace();
        await BaseService.checkSecurity(logger, "Markdown:Read", req, ds);

        const guid = req.params["guid"];
        const ret = await new MarkdownRepository(ds).findOneBy({ guid: guid });
        return ret;
    }

    public async getList(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<MarkdownDto[]> {
        await logger.trace();
        await BaseService.checkSecurity(logger, "Markdown:List", req, ds);

        const ret = await new MarkdownRepository(ds).find();
        return ret;
    }

    public async postSave(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurity(logger, "Markdown:Save", req, ds);

        const entity = new MarkdownEntity();
        entity.copyFrom(req.body as MarkdownDto);
        await new MarkdownRepository(ds).save([entity]);
    }

    public async deleteGuid(logger: Logger, req: express.Request, ds: EntitiesDataSource): Promise<void> {
        await logger.trace();
        await BaseService.checkSecurity(logger, "Markdown:Delete", req, ds);

        const guid = req.params["guid"];
        await new MarkdownRepository(ds).delete({ guid: guid });
    }
}