export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export const createLoadingState = (isLoading: boolean, message?: string): LoadingState => ({
  isLoading,
  message
});

export const LOADING_STATES = {
  // 일반적인 로딩 상태
  IDLE: createLoadingState(false),
  LOADING: createLoadingState(true),
  
  // 데이터 관련 로딩 상태
  FETCHING: createLoadingState(true, 'Fetching data...'),
  CREATING: createLoadingState(true, 'Creating...'),
  UPDATING: createLoadingState(true, 'Updating...'),
  DELETING: createLoadingState(true, 'Deleting...'),
  UPLOADING: createLoadingState(true, 'Uploading...'),
  
  // 인증 관련 로딩 상태
  AUTHENTICATING: createLoadingState(true, 'Authenticating...'),
  LOGGING_OUT: createLoadingState(true, 'Logging out...'),
  
  // 검색 관련 로딩 상태
  SEARCHING: createLoadingState(true, 'Searching...'),
  
  // 파일 관련 로딩 상태
  UPLOADING_FILE: createLoadingState(true, 'Uploading file...'),
  PROCESSING_FILE: createLoadingState(true, 'Processing file...'),
} as const;

export type LoadingStateKey = keyof typeof LOADING_STATES;