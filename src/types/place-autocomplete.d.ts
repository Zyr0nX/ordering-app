declare module "mapbox_search" {
  export interface Body {
    id: string;
  }

  export interface Action {
    endpoint: string;
    method: string;
    body: Body;
    multi_retrievable: boolean;
  }

  export interface ExternalIds {
    mbx_poi: string;
    foursquare: string;
    federated: string;
    tripadvisor: string;
  }

  export interface Context {
    layer: string;
    localized_layer: string;
    name: string;
  }

  export interface Metadata {
    iso_3166_1: string;
    iso_3166_2: string;
  }

  export interface Suggestion {
    feature_name: string;
    matching_name: string;
    highlighted_name: string;
    description: string;
    result_type: string[];
    language: string;
    action: Action;
    coordinates: string;
    maki: string;
    category: string[];
    internal_id: string;
    external_ids: ExternalIds;
    mapbox_id: string;
    context: Context[];
    metadata: Metadata;
  }

  export interface RootObject {
    suggestions: Suggestion[];
    attribution: string;
    version: string;
    response_uuid: string;
  }
}
