import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: [
    "shared/graphql/schemas/enums/*.graphql",
    "shared/graphql/schemas/*.graphql",
  ],
  documents: [
    "shared/graphql/fragments/*.graphql",
    "shared/graphql/queries/search.graphql",
    // "shared/graphql/mutations/*.graphql"
  ],
  generates: {
    "shared/api/graphql/generated/": {
      preset: "client-preset",
      config: {
        plugins: [
          {
            typescript: {},
          },
          {
            typescriptOperations: {},
          },
          {
            typescriptReactApollo: {},
          },
        ],
        useTypeImports: true,
        strictScalars: true,
        scalars: {
          UUID: "crypto#UUID",
          Time: "Date",
          Base64Bytes: "string",
          Int32: "number",
          Int64: "number",
          RawJSON: "Record<string, unknown>",
          DatatypeJSON: "Record<string, unknown>",
        },
        enumsAsTypes: false,
      },
    },
  },
};

export default config;
