// import axios, { AxiosInstance } from "axios";
// import axiosRetry from "axios-retry";

// interface HttpClientOptions {
//   apiKey: string;
//   baseURL: string;
// }

// export class HttpClient {
//   apiKey: string;
//   baseURL: string;
//   axios: AxiosInstance;
//   debug: boolean = false;

//   private sanitizeBaseUrl(baseURL: string): string {
//     return baseURL.trim().replace(/\/$/, "");
//   }

//   constructor(opts: HttpClientOptions) {
//     this.apiKey = opts.apiKey;
//     this.baseURL = this.sanitizeBaseUrl(opts.baseURL);
//     this.debug = process.env.NODE_ENV === "development";

//     this.axios = axios.create({
//       baseURL: this.baseURL,
//       headers: {
//         authorization: `Bearer ${this.apiKey}`,
//       },
//     });

//     axiosRetry(this.axios, {
//       retries: 5,
//       retryDelay: axiosRetry.exponentialDelay,
//       onRetry: (retryCount, error, requestConfig) => {
//         if (this.debug) {
//           console.log(
//             `Retry attempt #${retryCount} for ${requestConfig.url}, error=${error}`,
//           );
//         }
//       },
//     });
//   }
// }
