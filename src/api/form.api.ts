export interface NotezyException {
  code: number;
  reason: string;
  prefix: string;
  message: string;
  status: number;
  details: any;
  error: Error;
}

export interface NotezyRequest {
  header?: any;
  body?: any;
}

export interface NotezyResponse {
  success: boolean;
  data: any; // a map from string to string with GIN form
  exception: NotezyException | null;
}
