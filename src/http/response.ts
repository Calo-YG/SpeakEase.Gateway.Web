/**
 * 通用响应类型
 * @template P 响应数据的具体类型
 */
export interface ApiResponse<P = any> {
    /** 状态码 */
    code: number;
    /** 是否成功 */
    success: boolean;
    /** 响应消息 */
    message: string;
    /** 响应数据 */
    data: P;
    /** 时间戳 */
    timestamp: number;
}

/**
 * 分页响应类型
 * @template T 列表项类型
 */
export interface IPageResponse<T> {
    /** 当前页码 */
    current: number;
    /** 每页大小 */
    size: number;
    /** 总记录数 */
    total: number;
    /** 总页数 */
    pages: number;
    /** 数据列表 */
    records: T[];
}

/**
 * 文件上传响应类型
 */
export interface IUploadResponse {
    /** 文件URL */
    url: string;
    /** 文件名 */
    name: string;
    /** 文件大小 */
    size: number;
    /** 文件类型 */
    type: string;
}

/**
 * 登录/刷新令牌响应类型
 */
export interface TokenDto {
    /** 令牌 */
    token: string;
    /** 刷新令牌 */
    refreshToken: string;
}