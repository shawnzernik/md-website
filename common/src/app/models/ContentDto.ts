export interface ContentDto {
    guid: string;
    pathAndName: string;
    mimeType: string;
    encodedSize: number;
    created: Date;
    createdBy: string;
    modified: Date;
    modifiedBy: string;
    deleted?: Date;
    deletedBy?: string;
    viewUri: string;
    editUri: string;
    content: string;
}