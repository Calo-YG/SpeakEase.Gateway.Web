// 分页参数
export interface Pagination {
    /** 分页类型 */
    page: number;
  
    /** 每页数量 */
    pageSize: number;
  
    /** 排序字段 */
    order: string;
  
    /** 排序 */
    orderBy: string;
  }

  // 分页结果
export interface PageResult<T> {
    /** 总条数 */
    total: number;
  
    /** 数据 */
    data: T[];
  }