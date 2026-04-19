export type ApiResponse<TData = object> = {
    statuscode: number,
    data?: TData,
    message: string,
    success: boolean
}