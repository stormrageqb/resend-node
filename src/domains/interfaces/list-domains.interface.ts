import { ErrorResponse } from '../../interfaces';
import { Domain } from './domain';

export type ListDomainsResponseSuccess = Domain[];

export interface ListDomainsResponse {
  data: ListDomainsResponseSuccess | null;
  error: ErrorResponse | null;
}
