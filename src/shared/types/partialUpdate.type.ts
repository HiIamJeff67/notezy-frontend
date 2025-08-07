export interface PartialUpdate<Fields> {
  values: Partial<Fields>;
  setNull?: {
    [Key in keyof Fields]?: boolean;
  };
}
