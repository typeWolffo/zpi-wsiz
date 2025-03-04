/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface RegisterBody {
  /** @format email */
  email: string;
  /**
   * @minLength 1
   * @maxLength 64
   */
  firstName: string;
  /**
   * @minLength 1
   * @maxLength 64
   */
  lastName: string;
  /**
   * @minLength 8
   * @maxLength 64
   */
  password: string;
}

export interface RegisterResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface LoginBody {
  /** @format email */
  email: string;
  /**
   * @minLength 8
   * @maxLength 64
   */
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export type LogoutResponse = null;

export type RefreshTokensResponse = null;

export interface CurrentUserResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface ForgotPasswordBody {
  /**
   * @format email
   * @minLength 1
   */
  email: string;
}

export interface CreatePasswordBody {
  /**
   * @minLength 8
   * @maxLength 64
   */
  password: string;
  /** @minLength 1 */
  createToken: string;
}

export interface ResetPasswordBody {
  /**
   * @minLength 8
   * @maxLength 64
   */
  newPassword: string;
  /** @minLength 1 */
  resetToken: string;
}

export interface GetUsersResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }[];
  pagination: {
    totalItems: number;
    page: number;
    perPage: number;
  };
  appliedFilters?: object;
}

export interface GetUserByIdResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface GetUserDetailsResponse {
  data: {
    firstName: string | null;
    lastName: string | null;
    /** @format uuid */
    id: string;
    description: string | null;
    contactEmail: string | null;
    contactPhone: string | null;
    jobTitle: string | null;
  };
}

export interface UpdateUserBody {
  firstName?: string;
  lastName?: string;
  /** @format email */
  email?: string;
  role?: "admin" | "employee";
  archived?: boolean;
}

export interface UpdateUserResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export interface UpsertUserDetailsBody {
  description?: string;
  /** @format email */
  contactEmail?: string;
  contactPhoneNumber?: string;
  jobTitle?: string;
}

export interface UpsertUserDetailsResponse {
  data: {
    /** @format uuid */
    id: string;
    message: string;
  };
}

export interface ChangePasswordBody {
  /**
   * @minLength 8
   * @maxLength 64
   */
  newPassword: string;
  /**
   * @minLength 8
   * @maxLength 64
   */
  oldPassword: string;
}

export type ChangePasswordResponse = null;

export type DeleteUserResponse = null;

export interface CreateUserBody {
  /** @format email */
  email: string;
  /**
   * @minLength 1
   * @maxLength 64
   */
  firstName: string;
  /**
   * @minLength 1
   * @maxLength 64
   */
  lastName: string;
  role: "admin" | "employee";
}

export interface CreateUserResponse {
  data: {
    /** @format uuid */
    id: string;
    message: string;
  };
}

export interface GetMechanicsResponse {
  data: ({
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } & {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    /** @format uuid */
    userId: string;
    shiftStart: string;
    shiftEnd: string;
  })[];
}

export interface GetMechanicByIdResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  } & {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    /** @format uuid */
    userId: string;
    shiftStart: string;
    shiftEnd: string;
  };
}

export interface UpdateMechanicBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  /** @format uuid */
  userId?: string;
  shiftStart?: string;
  shiftEnd?: string;
}

export interface UpdateMechanicResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    /** @format uuid */
    userId: string;
    shiftStart: string;
    shiftEnd: string;
  };
}

export type DeleteMechanicResponse = null;

export interface CreateMechanicBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  /** @format uuid */
  userId: string;
  shiftStart: string;
  shiftEnd: string;
}

export interface CreateMechanicResponse {
  data: {
    /** @format uuid */
    id: string;
    message: string;
  };
}

export interface GetVehiclesResponse {
  data: ({
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    /** @format uuid */
    customerId: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
  } & {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  })[];
}

export interface GetVehicleByIdResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    /** @format uuid */
    customerId: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
  } & {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
}

export interface GetVehiclesByCustomerIdResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    /** @format uuid */
    customerId: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
  }[];
}

export interface UpdateVehicleBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  /** @format uuid */
  customerId?: string;
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  registrationNumber?: string;
}

export interface UpdateVehicleResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    /** @format uuid */
    customerId: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
  };
}

export type DeleteVehicleResponse = null;

export interface CreateVehicleBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  /** @format uuid */
  customerId: string;
  make: string;
  model: string;
  year: string;
  vin: string;
  registrationNumber: string;
}

export interface CreateVehicleResponse {
  data: {
    /** @format uuid */
    id: string;
    message: string;
  };
}

export interface GetRepairOrdersResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    description: string;
    assignedMechanicId: string | null;
    vehicleId: string | null;
    startDate: string;
    endDate: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhoneNumber: string;
  }[];
}

export interface GetRepairOrderByIdResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    description: string;
    assignedMechanicId: string | null;
    vehicleId: string | null;
    startDate: string;
    endDate: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhoneNumber: string;
  };
}

export interface UpdateRepairOrderBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  description?: string;
  assignedMechanicId?: string | null;
  vehicleId?: string | null;
  startDate?: string;
  endDate?: string;
}

export interface UpdateRepairOrderResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    description: string;
    assignedMechanicId: string | null;
    vehicleId: string | null;
    startDate: string;
    endDate: string;
    make: string;
    model: string;
    year: string;
    vin: string;
    registrationNumber: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhoneNumber: string;
  };
}

export type DeleteRepairOrderResponse = null;

export interface CreateRepairOrderBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  description: string;
  assignedMechanicId?: string | null;
  vehicleId?: string | null;
  startDate: string;
  endDate: string;
}

export interface CreateRepairOrderResponse {
  data: {
    /** @format uuid */
    id: string;
    message: string;
  };
}

export interface GetCustomersResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  }[];
}

export interface GetCustomerByIdResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
}

export interface UpdateCustomerBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
}

export interface UpdateCustomerResponse {
  data: {
    /** @format uuid */
    id: string;
    createdAt: string;
    archivedAt: string | null;
    updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string | null;
  };
}

export type DeleteCustomerResponse = null;

export interface CreateCustomerBody {
  /** @format uuid */
  id?: string;
  createdAt?: string;
  archivedAt?: string | null;
  updatedAt?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
}

export interface CreateCustomerResponse {
  data: {
    /** @format uuid */
    id: string;
    message: string;
  };
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[method.toLowerCase() as keyof HeadersDefaults]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] = property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(key, isFileType ? formItem : this.stringifyFormItem(formItem));
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (type === ContentType.Text && body && body !== null && typeof body !== "string") {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title ZPI API
 * @version 1.0
 * @contact
 */
export class API<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerRegister
     * @request POST:/api/auth/register
     */
    authControllerRegister: (data: RegisterBody, params: RequestParams = {}) =>
      this.request<RegisterResponse, any>({
        path: `/api/auth/register`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerLogin
     * @request POST:/api/auth/login
     */
    authControllerLogin: (data: LoginBody, params: RequestParams = {}) =>
      this.request<LoginResponse, any>({
        path: `/api/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerLogout
     * @request POST:/api/auth/logout
     */
    authControllerLogout: (params: RequestParams = {}) =>
      this.request<LogoutResponse, any>({
        path: `/api/auth/logout`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerRefreshTokens
     * @request POST:/api/auth/refresh
     */
    authControllerRefreshTokens: (params: RequestParams = {}) =>
      this.request<RefreshTokensResponse, any>({
        path: `/api/auth/refresh`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerCurrentUser
     * @request GET:/api/auth/current-user
     */
    authControllerCurrentUser: (params: RequestParams = {}) =>
      this.request<CurrentUserResponse, any>({
        path: `/api/auth/current-user`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerForgotPassword
     * @request POST:/api/auth/forgot-password
     */
    authControllerForgotPassword: (data: ForgotPasswordBody, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/forgot-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerCreatePassword
     * @request POST:/api/auth/create-password
     */
    authControllerCreatePassword: (data: CreatePasswordBody, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/create-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags Auth
     * @name AuthControllerResetPassword
     * @request POST:/api/auth/reset-password
     */
    authControllerResetPassword: (data: ResetPasswordBody, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/api/auth/reset-password`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerGetUsers
     * @request GET:/api/user/all
     */
    userControllerGetUsers: (
      query?: {
        keyword?: string;
        role?: string;
        archived?: string;
        /** @min 1 */
        page?: number;
        perPage?: number;
        sort?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<GetUsersResponse, any>({
        path: `/api/user/all`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerGetUserById
     * @request GET:/api/user/{id}
     */
    userControllerGetUserById: (id: string, params: RequestParams = {}) =>
      this.request<GetUserByIdResponse, any>({
        path: `/api/user/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerUpdateUser
     * @request PATCH:/api/user/{id}
     */
    userControllerUpdateUser: (id: string, data: UpdateUserBody, params: RequestParams = {}) =>
      this.request<UpdateUserResponse, any>({
        path: `/api/user/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerDeleteUser
     * @request DELETE:/api/user/{id}
     */
    userControllerDeleteUser: (id: string, params: RequestParams = {}) =>
      this.request<DeleteUserResponse, any>({
        path: `/api/user/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerGetUserDetails
     * @request GET:/api/user/details/{id}
     */
    userControllerGetUserDetails: (id: string, params: RequestParams = {}) =>
      this.request<GetUserDetailsResponse, any>({
        path: `/api/user/details/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerUpsertUserDetails
     * @request PATCH:/api/user/details/{id}
     */
    userControllerUpsertUserDetails: (
      id: string,
      data: UpsertUserDetailsBody,
      params: RequestParams = {},
    ) =>
      this.request<UpsertUserDetailsResponse, any>({
        path: `/api/user/details/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerChangePassword
     * @request PATCH:/api/user/change-password
     */
    userControllerChangePassword: (
      query: {
        /** @format uuid */
        id: string;
      },
      data: ChangePasswordBody,
      params: RequestParams = {},
    ) =>
      this.request<ChangePasswordResponse, any>({
        path: `/api/user/change-password`,
        method: "PATCH",
        query: query,
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags User
     * @name UserControllerCreateUser
     * @request POST:/api/user
     */
    userControllerCreateUser: (data: CreateUserBody, params: RequestParams = {}) =>
      this.request<CreateUserResponse, any>({
        path: `/api/user`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mechanic
     * @name MechanicControllerGetMechanics
     * @request GET:/api/mechanic/all
     */
    mechanicControllerGetMechanics: (params: RequestParams = {}) =>
      this.request<GetMechanicsResponse, any>({
        path: `/api/mechanic/all`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mechanic
     * @name MechanicControllerGetMechanicById
     * @request GET:/api/mechanic/{id}
     */
    mechanicControllerGetMechanicById: (id: string, params: RequestParams = {}) =>
      this.request<GetMechanicByIdResponse, any>({
        path: `/api/mechanic/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mechanic
     * @name MechanicControllerUpdateMechanic
     * @request PATCH:/api/mechanic/{id}
     */
    mechanicControllerUpdateMechanic: (
      id: string,
      data: UpdateMechanicBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateMechanicResponse, any>({
        path: `/api/mechanic/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mechanic
     * @name MechanicControllerDeleteMechanic
     * @request DELETE:/api/mechanic/{id}
     */
    mechanicControllerDeleteMechanic: (id: string, params: RequestParams = {}) =>
      this.request<DeleteMechanicResponse, any>({
        path: `/api/mechanic/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Mechanic
     * @name MechanicControllerCreateMechanic
     * @request POST:/api/mechanic
     */
    mechanicControllerCreateMechanic: (data: CreateMechanicBody, params: RequestParams = {}) =>
      this.request<CreateMechanicResponse, any>({
        path: `/api/mechanic`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vehicle
     * @name VehicleControllerGetVehicles
     * @request GET:/api/vehicle/all
     */
    vehicleControllerGetVehicles: (params: RequestParams = {}) =>
      this.request<GetVehiclesResponse, any>({
        path: `/api/vehicle/all`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vehicle
     * @name VehicleControllerGetVehicleById
     * @request GET:/api/vehicle/{id}
     */
    vehicleControllerGetVehicleById: (id: string, params: RequestParams = {}) =>
      this.request<GetVehicleByIdResponse, any>({
        path: `/api/vehicle/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vehicle
     * @name VehicleControllerUpdateVehicle
     * @request PATCH:/api/vehicle/{id}
     */
    vehicleControllerUpdateVehicle: (
      id: string,
      data: UpdateVehicleBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateVehicleResponse, any>({
        path: `/api/vehicle/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vehicle
     * @name VehicleControllerDeleteVehicle
     * @request DELETE:/api/vehicle/{id}
     */
    vehicleControllerDeleteVehicle: (id: string, params: RequestParams = {}) =>
      this.request<DeleteVehicleResponse, any>({
        path: `/api/vehicle/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vehicle
     * @name VehicleControllerGetVehiclesByCustomerId
     * @request GET:/api/vehicle/customer/{customerId}
     */
    vehicleControllerGetVehiclesByCustomerId: (customerId: string, params: RequestParams = {}) =>
      this.request<GetVehiclesByCustomerIdResponse, any>({
        path: `/api/vehicle/customer/${customerId}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Vehicle
     * @name VehicleControllerCreateVehicle
     * @request POST:/api/vehicle
     */
    vehicleControllerCreateVehicle: (data: CreateVehicleBody, params: RequestParams = {}) =>
      this.request<CreateVehicleResponse, any>({
        path: `/api/vehicle`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags RepairOrder
     * @name RepairOrderControllerGetRepairOrders
     * @request GET:/api/repair-order/all
     */
    repairOrderControllerGetRepairOrders: (params: RequestParams = {}) =>
      this.request<GetRepairOrdersResponse, any>({
        path: `/api/repair-order/all`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags RepairOrder
     * @name RepairOrderControllerGetRepairOrderById
     * @request GET:/api/repair-order/{id}
     */
    repairOrderControllerGetRepairOrderById: (id: string, params: RequestParams = {}) =>
      this.request<GetRepairOrderByIdResponse, any>({
        path: `/api/repair-order/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags RepairOrder
     * @name RepairOrderControllerUpdateRepairOrder
     * @request PATCH:/api/repair-order/{id}
     */
    repairOrderControllerUpdateRepairOrder: (
      id: string,
      data: UpdateRepairOrderBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateRepairOrderResponse, any>({
        path: `/api/repair-order/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags RepairOrder
     * @name RepairOrderControllerDeleteRepairOrder
     * @request DELETE:/api/repair-order/{id}
     */
    repairOrderControllerDeleteRepairOrder: (id: string, params: RequestParams = {}) =>
      this.request<DeleteRepairOrderResponse, any>({
        path: `/api/repair-order/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags RepairOrder
     * @name RepairOrderControllerCreateRepairOrder
     * @request POST:/api/repair-order
     */
    repairOrderControllerCreateRepairOrder: (
      data: CreateRepairOrderBody,
      params: RequestParams = {},
    ) =>
      this.request<CreateRepairOrderResponse, any>({
        path: `/api/repair-order`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Customer
     * @name CustomerControllerGetCustomers
     * @request GET:/api/customer/all
     */
    customerControllerGetCustomers: (params: RequestParams = {}) =>
      this.request<GetCustomersResponse, any>({
        path: `/api/customer/all`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Customer
     * @name CustomerControllerGetCustomerById
     * @request GET:/api/customer/{id}
     */
    customerControllerGetCustomerById: (id: string, params: RequestParams = {}) =>
      this.request<GetCustomerByIdResponse, any>({
        path: `/api/customer/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Customer
     * @name CustomerControllerUpdateCustomer
     * @request PATCH:/api/customer/{id}
     */
    customerControllerUpdateCustomer: (
      id: string,
      data: UpdateCustomerBody,
      params: RequestParams = {},
    ) =>
      this.request<UpdateCustomerResponse, any>({
        path: `/api/customer/${id}`,
        method: "PATCH",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Customer
     * @name CustomerControllerDeleteCustomer
     * @request DELETE:/api/customer/{id}
     */
    customerControllerDeleteCustomer: (id: string, params: RequestParams = {}) =>
      this.request<DeleteCustomerResponse, any>({
        path: `/api/customer/${id}`,
        method: "DELETE",
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags Customer
     * @name CustomerControllerCreateCustomer
     * @request POST:/api/customer
     */
    customerControllerCreateCustomer: (data: CreateCustomerBody, params: RequestParams = {}) =>
      this.request<CreateCustomerResponse, any>({
        path: `/api/customer`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
