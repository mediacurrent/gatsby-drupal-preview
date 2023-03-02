export type AccessToken = {
  token_type: string
  expires_in: number
  access_token: string
  refresh_token?: string
}

export interface JsonapiAuthUsernamePassword {
  username: string
  password: string
}

export interface JsonapiAuthClientIdSecret {
  clientId: string
  clientSecret: string
  url?: string
  scope?: string
}

export type JsonapiAuthAccessToken = AccessToken

export type JsonapiAuthApiKey = string

export type BaseUrl = string

export type PathPrefix = string

// https://jsonapi.org/format/#error-objects
export interface JsonApiError {
  id?: string
  status?: string
  code?: string
  title?: string
  detail?: string
  links?: JsonApiLinks
}

// https://jsonapi.org/format/#document-links
export interface JsonApiLinks {
  [key: string]: string | Record<string, string>
}

export interface JsonApiCollectionResponse extends Record<string, any> {
  jsonapi?: {
    version: string
    meta: Record<string, any>[]
  }
  data: JsonApiResourceObject[]
  errors: JsonApiError[]
  meta: {
    count: number
    [key: string]: any
  }
  links?: JsonApiLinks
  included?: JsonApiResourceObject[]
}

export interface JsonApiResponse extends Record<string, any> {
  jsonapi?: {
    version: string
    meta: Record<string, any>[]
  }
  data: JsonApiResourceObject
  errors: JsonApiError[]
  meta: {
    count: number
    [key: string]: any
  }
  links?: JsonApiLinks
  included?: JsonApiResourceObject[]
}

export interface JsonApiResourceObject {
  type: string
  id: string
  links?: JsonApiLinks
  attributes: Record<string, any>
  relationships?: Record<string, any>
}

export interface JsonApiRelationship {
  data: JsonApiRelationshipObject[] | null
}

export interface JsonApiRelationshipObject {
  type: string
  id: string
  meta?: Record<string, any>
}

export interface GatsbyDrupalNode extends Record<string, any> {
  relationships?: Record<string, JsonApiRelationship>
}