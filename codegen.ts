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
    "src/graphql/generated/": {
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
          UUID: "UUID",
          Time: "Date",
          Base64Bytes: "string",
          Int32: "number",
          Int64: "number",
        },
        enumsAsTypes: false,
      },
    },
  },
};

export default config;
