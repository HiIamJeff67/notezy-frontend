export type ExceptionCode = number;
export type ExceptionPrefix = string;

export class NotezyException {
  code: number;
  prefix: string;
  reason: string;
  message: string;
  status: number;
  details?: any;
  error?: Error;

  constructor(
    code: number,
    prefix: string,
    reason: string,
    message: string,
    status: number,
    details?: any,
    error?: Error
  ) {
    this.code = code;
    this.prefix = prefix;
    this.reason = reason;
    this.message = message;
    this.status = status;
    this.details = details;
    this.error = error;
  }

  static fromJSON(obj: any): NotezyException {
    return new NotezyException(
      obj.code,
      obj.prefix,
      obj.reason,
      obj.message,
      obj.status,
      obj.details,
      obj.error
    );
  }

  toJSON(): any {
    return {
      code: this.code,
      reason: this.reason,
      prefix: this.prefix,
      message: this.message,
      status: this.status,
      details: this.details,
      // error: this.error
    };
  }

  toString() {
    if (this.error) {
      return `[${this.code}]${this.reason}: ${this.error}`;
    }
    return `[${this.code}]${this.reason}: ${this.message}`;
  }

  log(errorMode: boolean = true): this {
    if (errorMode) {
      console.error(
        `[${this.code}]${this.reason}: ${this.message}${
          this.error && `(${this.error})`
        }`
      );
    } else {
      console.log(
        `[${this.code}]${this.reason}: ${this.message}${
          this.error && `(${this.error})`
        }`
      );
    }

    return this;
  }

  equals(
    other: NotezyException,
    withMessage: boolean = false,
    withDetails: boolean = false,
    withError: boolean = false
  ): boolean {
    return (
      this.code === other.code &&
      this.reason === other.reason &&
      this.prefix === other.prefix &&
      (!withMessage || this.message === other.message) &&
      this.status === other.status &&
      (!withDetails || this.details === other.details) &&
      (!withError || this.error === other.error)
    );
  }
}
