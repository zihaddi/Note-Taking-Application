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
    /**
     * GET /api/posts — public (no auth required)
     */
    async function getPublicPosts(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Post>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${PUBLIC_BASE}${query ? "?" + query : ""}`, {
            method: "GET",
        })
    }

    /**
     * GET /api/posts/:id — public
     */
    async function getPost(id: string): Promise<ApiResponse<Post>> {
        return $fetchApi(`${PUBLIC_BASE}/${id}`, {method: "GET"})
    }

    /**
     * GET /api/user/posts — auth required
     */
    async function getMyPosts(
        params: Record<string, any> = {},
    ): Promise<PaginatedResponse<Post>> {
        const query = new URLSearchParams(params).toString()
        return $fetchApi(`${BASE}${query ? "?" + query : ""}`, {method: "GET"})
    }

    /**
     * POST /api/user/posts
     */
    async function createPost(
        data: CreatePostData,
    ): Promise<ApiResponse<Post>> {
        return $fetchApi(BASE, {method: "POST", body: data})
    }

    /**
     * PUT /api/user/posts/:id
     */
    async function updatePost(
        id: string,
        data: Partial<CreatePostData>,
    ): Promise<ApiResponse<Post>> {
        return $fetchApi(`${BASE}/${id}`, {method: "PUT", body: data})
    }

    /**
     * DELETE /api/user/posts/:id
     */
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
