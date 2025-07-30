export interface PartialUpdate<Fields> {
  Values: Fields;
  SetNull?: {
    [Key in keyof Fields]?: boolean;
  };
}
