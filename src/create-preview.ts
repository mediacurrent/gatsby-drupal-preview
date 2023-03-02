import camelize from "lodash/camelCase"

import {
  GatsbyDrupalNode,
  JsonApiRelationshipObject,
  JsonApiResourceObject,
  JsonApiResponse
} from "./types"

export const createNodeFromPreview = (data: JsonApiResponse, baseUrl: string, nodeAlias?: string) => {
  const includedById = new Map<string, JsonApiResourceObject>();
  baseUrl.replace(/\/$/, '')

  if (data.included) {
    data.included.forEach((resource) => includedById.set(resource.id, resource));
  }

  const getInclude = (node: JsonApiRelationshipObject): GatsbyDrupalNode | undefined => {
    const match = includedById.get(node.id);
    if (match) {
      const relationships: Record<string, any> = {};
      if (match.relationships) {
        for (const [key, value] of Object.entries(match.relationships)) {
          const data = value.data;
          if (data) {
            if (Array.isArray(data)) {
              const includes: any[] = [];
              for (const item of data) {
                const include = getInclude(item);
                if (include) {
                  includes.push({ ...include, id: item.id });
                }
              }
              if (includes.length) {
                relationships[key] = includes;
              }
            } else {
              const include = getInclude(data);
              if (include) {
                if (data.type === "file--file") {
                  const meta = data.meta;
                  const src = `${baseUrl}${include.uri.url}`;
                  relationships[key] = { ...include, publicUrl: src };
                } else {
                  relationships[key] = { ...include };
                }
              }
            }
          }
        }
      }
      const type = match.type.replace(/-|__|:|\.|\s/g, "_");
      return { ...match.attributes, __typename: type, relationships };
    }
  };

  const relationships: Record<string, any> = {};
  const dataRelationships = data.data.relationships;
  if (data.included && dataRelationships) {
    for (const [key, value] of Object.entries(dataRelationships)) {
      const data = value.data;
      if (data) {
        if (Array.isArray(data)) {
          const references: any[] = [];
          for (const item of data) {
            const include = getInclude(item);
            if (include) {
              references.push({ ...include, id: item.id });
            }
          }
          if (references.length) {
            relationships[key] = references;
          }
        } else {
          const include = getInclude(data);
          if (include) {
            relationships[key] = { ...include };
          }
        }
      }
    }
  }
  const alias = nodeAlias || camelize(data.data.type);

  return {
    [alias]: {
      ...data.data.attributes,
      relationships,
    },
  };
};
