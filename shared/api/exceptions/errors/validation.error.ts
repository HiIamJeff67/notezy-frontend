import { NotezyException } from "@shared/api/exceptions";
import { NotezyError } from ".";

export class NotezyValidationError extends NotezyError {
  private readonly exception: NotezyException;

  constructor(exception: NotezyException) {
    super(exception.reason, true, exception.message);
    this.name = "FetchError";
    this.exception = exception;
  }

  get unWrap(): NotezyException {
    return this.exception;
  }
}
