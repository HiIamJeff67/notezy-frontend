import z from "zod";

export interface ZodClass<T extends z.ZodRawShape>
  extends Omit<z.ZodObject<T>, "parse"> {
  parse(value: unknown): InstanceType<this>;

  new (data: z.infer<z.ZodObject<T>>): z.infer<z.ZodObject<T>>;
}

export function ZodClass<T extends z.ZodRawShape>(shape: T): ZodClass<T> {
  const schema = z.object(shape);
  return class {
    constructor(value: z.infer<z.ZodObject<T>>) {
      Object.assign(this, schema.parse(value));
    }
  } as any;
}

/*
 * Usage:
 * `TypeScript
 * class HelloObject extends ZClass({
 *   key: z.string(),
 * }) {}
 *
 * new HelloObject({
 *   key: "",
 * });
 * `
 */
