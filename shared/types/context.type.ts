import { NotezyException } from "./apiException.type";

export interface NotezyRequest {
  header?: any;
  body?: any;
}

export interface NotezyResponse {
  success: boolean;
  data: any; // a map from string to string with GIN form
  exception: NotezyException | null;
}
