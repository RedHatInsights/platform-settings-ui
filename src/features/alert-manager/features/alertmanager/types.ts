import type { EndpointType } from '../../data/types/events.types';

export type { EndpointType };

export interface EventType {
  id: string;
  name: string;
  display_name: string;
  application_id: string;
  application: {
    id: string;
    name: string;
    display_name: string;
    bundle_id: string;
  };
  description?: string;
  visible: boolean;
  subscribed_by_default: boolean;
}

export interface EventTypesResponse {
  data: EventType[];
  meta: {
    count: number;
  };
}

export interface EventTypesParams {
  limit?: number;
  offset?: number;
  sortBy?: string;
  eventTypeName?: string;
  applicationIds?: string[];
}

export interface EndpointInfo {
  id: string;
  type: EndpointType;
  sub_type?: string;
  name: string;
  enabled: boolean;
}

export interface BehaviorGroupAction {
  endpoint: EndpointInfo;
}

export interface BehaviorGroup {
  id: string;
  display_name: string;
  actions: BehaviorGroupAction[];
}

export interface NotifierSummary {
  type: EndpointType;
  subType?: string;
}
