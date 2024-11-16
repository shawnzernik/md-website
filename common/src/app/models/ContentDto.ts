export interface ContentDto {
    guid: string;
    pathAndName: string;
    mimeType: string;
    base64Encoded: boolean;
    encodedSize: number;
    securablesGuid: string;
    created: Date;
    createdBy: string;
    modified: Date;
    modifiedBy: string;
    deleted?: Date;
    deletedBy?: string;
}