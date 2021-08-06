import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelTokenSource, AxiosError } from 'axios';
import { Observable } from 'rxjs';

const { CancelToken } = axios;

export class AxiosProxy {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  get<T>(url: string, config?: AxiosRequestConfig): Observable<T> {
    const source = CancelToken.source();

    return toObservable(
      () =>
        this.axiosInstance.get<T>(url, {
          cancelToken: source.token,
          ...config,
        }),
      source,
    );
  }

  post<T, D = unknown>(url: string, data?: D, config?: AxiosRequestConfig): Observable<T> {
    const source = CancelToken.source();

    return toObservable(
      () =>
        this.axiosInstance.post<T>(url, data, {
          cancelToken: source.token,
          ...config,
        }),
      source,
    );
  }

  patch<T, D = unknown>(url: string, data: D, config?: AxiosRequestConfig): Observable<T> {
    const source = CancelToken.source();
    return toObservable(() => this.axiosInstance.patch<T>(url, data, { cancelToken: source.token, ...config }), source);
  }

  delete<T>(url: string, config?: AxiosRequestConfig): Observable<T> {
    const source = CancelToken.source();
    return toObservable(() => this.axiosInstance.delete<T>(url, { cancelToken: source.token, ...config }), source);
  }
}

export function toObservable<T>(
  requestCreator: () => Promise<AxiosResponse<T>>,
  cancelToken: CancelTokenSource,
): Observable<T> {
  return new Observable<T>((subscriber) => {
    requestCreator()
      .then((result) => {
        subscriber.next(result.data);
        subscriber.complete();
      })
      .catch((error: AxiosError) => {
        if (!axios.isCancel(error)) {
          subscriber.error(error.response);
        }
      });
    return () => cancelToken.cancel();
  });
}
