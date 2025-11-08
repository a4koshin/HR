import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API } from "./api";

const user = JSON.parse(localStorage.getItem("user"));


export const daynamicApi = createApi({
  reducerPath: "daynamicApi",
  baseQuery: fetchBaseQuery({ baseUrl: `${API}` }),
  tagTypes: ["customers", "invoices", "colors"],
  endpoints: (builder) => ({
    createFuction: builder.mutation({
      query: ({ formData, url }) => {
        return {
          url: `${url}`,
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
          contentType: "application/json"
        };
      },
      invalidatesTags: ["customers", "invoices", "colors"],
    }),
    getAllPatients: builder.query({
      query: ({ url, page, limit, type, search }) => {
        let queryString = `${url}?page=${page}&limit=${limit}`;
        if (type) queryString += `&type=${type}`;
        if (search) queryString += `&search=${search}`;
        return {
          url: queryString,
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: ["customers"],
    }),

    getAll: builder.query({
      query: ({ id, url }) => {
        return {
          url: `${url}?id=${id}`, // Adjust the URL path according to your API route
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: (result, error, { pid }) => [
        { type: "notes", id: pid },
        { type: "notes", id: "LIST" },
      ],
    }),

    updateFunction: builder.mutation({
      query({ formData, id, url }) {
        return {
          url: `${url}/${id}`,
          method: "PUT",
          body: formData,
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },

      invalidatesTags: ["customers", "invoices"],
    }),

    getByIdFunction: builder.query({
      query: ({ id, url }) => {
        return {
          url: `${url}/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: ["customers", "invoices"],
    }),

    getallFunction: builder.query({
      query({ url }) {
        return {
          url: `${url}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: (result) => {
        // console.log("Dynamic API result:", result); // Keep for debugging
    
        const items = Array.isArray(result?.employees) ? result.employees : [];
    
        return [
          ...items
            .map(({ _id }) => [
              { type: "customers", id: _id },
              { type: "invoices", id: _id },
              { type: "colors", id: _id },
            ])
            .flat(),
          { type: "customers", id: "LIST" },
          { type: "invoices", id: "LIST" },
          { type: "colors", id: "LIST" },
        ];
      },
    }),
    getallFunctionByOwner: builder.query({
      query({ url, id }) {
        return {
          url: `${url}/${id}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result
                .map(({ id }) => [
                  { type: "customers", id },
                  { type: "invoices", id },
                  { type: "colors", id },
                ])
                .flat(),
              { type: "customers", id: "LIST" },
              { type: "invoices", id: "LIST" },
              { type: "colors", id: "LIST" },
            ]
          : [
              { type: "customers", id: "LIST" },
              { type: "invoices", id: "LIST" },
              { type: "colors", id: "LIST" },
            ],
    }),
  }),
});

export const {
  useCreateFuctionMutation,
  useUpdateFunctionMutation,
  useGetAllQuery,
  useGetByIdFunctionQuery,
  useGetallFunctionQuery,
  useGetAllPatientsQuery,
  useGetallFunctionByOwnerQuery,
} = daynamicApi;