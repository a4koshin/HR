import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API } from "../api";

const user = JSON.parse(localStorage.getItem("user"));

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API}` }),
  tagTypes: ["provider", "users"],
  endpoints: (builder) => ({
    loginProvider: builder.mutation({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),

    registerProvider: builder.mutation({
      query: ({ formData }) => {
        return {
          url: "/auth/register",
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      invalidatesTags: ["users"],
    }),

    updateProvider: builder.mutation({
      query({ formData, id }) {
        return {
          url: `/providers/provider/${id}`,
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },

      invalidatesTags: ["users"],
    }),

    updateUser: builder.mutation({
      query({ formData, id }) {
        return {
          url: `/users/user/update/${id}`,
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },

      invalidatesTags: ["users"],
    }),

    updateOrg: builder.mutation({
      query({ formData, id }) {
        return {
          url: `/users/user/update/company/${id}`,
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },

      invalidatesTags: ["users"],
    }),

    updateAppUserPassword: builder.mutation({
      query({ formData, id }) {
        return {
          url: `/provider/change-password/${id}`,
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },

      invalidatesTags: ["provider"],
    }),

    getUserById: builder.query({
      query: (id) => {
        return {
          url: `/user/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: ["users"],
    }),

    getCompanyId: builder.query({
      query: ({ id }) => {
        return {
          url: `/users/user/company/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: ["users"],
    }),

    getProviders: builder.query({
      query() {
        return {
          url: "/providers",
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "provider", id })),
              { type: "provider", id: "LIST" },
            ]
          : [{ type: "provider", id: "LIST" }],
    }),

    // users
    getUsers: builder.query({
      query() {
        return {
          url: "/users",
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "users", id })),
              { type: "users", id: "LIST" },
            ]
          : [{ type: "users", id: "LIST" }],
    }),

    registerUser: builder.mutation({
      query: ({ formData }) => {
        return {
          url: "/users/register",
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      invalidatesTags: ["users"],
    }),
  }),
});

export const {
  useLoginProviderMutation,
  useRegisterProviderMutation,
  useGetProvidersQuery,
  useUpdateProviderMutation,
  useGetUsersQuery,
  useRegisterUserMutation,
  useUpdateUserMutation,
  useGetUserByIdQuery,
  useGetCompanyIdQuery,
  useUpdateAppUserPasswordMutation,
  useUpdateOrgMutation,
} = authApi;