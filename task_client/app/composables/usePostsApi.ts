import {$fetchApi} from "~/utils/$fetch"
import type {
    PaginatedResponse,
    Post,
    CreatePostData,
    ApiResponse,
} from "~/types"

const BASE = "/api/user/posts"
const PUBLIC_BASE = "/api/posts"

/**
 * usePostsApi — public post listing and user post CRUD.
 */
export const usePostsApi = () => {
    async function getPublicPosts(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Post>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${PUBLIC_BASE}${query ? "?" + query : ""}`, {
            method: "GET",
        })
    }

    async function getPost(id: string): Promise<ApiResponse<Post>> {
        return $fetchApi(`${PUBLIC_BASE}/${id}`, {method: "GET"})
    }

    async function getMyPosts(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Post>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    async function createPost(
        data: CreatePostData,
    ): Promise<ApiResponse<Post>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    async function updatePost(
        id: string,
        data: Partial<CreatePostData>,
    ): Promise<ApiResponse<Post>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    async function deletePost(id: string): Promise<ApiResponse<null>> {
        return $fetchApi(`${BASE}/${id}`, {method: "DELETE"})
    }

    return {
        getPublicPosts,
        getPost,
        getMyPosts,
        createPost,
        updatePost,
        deletePost,
    }
}
