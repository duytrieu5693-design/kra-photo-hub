declare module 'exif-parser' {
  interface ExifTags {
    DateTimeOriginal?: number;
    DateTime?: number;
    Make?: string;
    Model?: string;
    LensModel?: string;
    ImageWidth?: number;
    ImageHeight?: number;
    [key: string]: unknown;
  }
  interface ExifResult {
    tags: ExifTags;
    imageSize?: { width: number; height: number };
  }
  interface Parser {
    parse(): ExifResult;
    enableBinaryFields(enabled: boolean): Parser;
    enableSimpleValues(enabled: boolean): Parser;
    enableTagNames(enabled: boolean): Parser;
    enableImageSize(enabled: boolean): Parser;
  }
  function create(buffer: Buffer): Parser;
}
