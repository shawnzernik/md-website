import { DataSource, Repository } from "typeorm";
import { MarkdownEntity } from "./MarkdownEntity";

export class MarkdownRepository extends Repository<MarkdownEntity> {
    public constructor(ds: DataSource) {
        super(MarkdownEntity, ds.createEntityManager(), ds.createQueryRunner());
    }
}