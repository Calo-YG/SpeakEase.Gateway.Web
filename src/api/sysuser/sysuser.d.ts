import { Pagination } from "../common";

// 用户分页
export interface UserPageDto {
    /** 用户主键 */
    id: string;
  
    /** 账号 */
    account: string;
  
    /** 密码 */
    password: string;
  
    /** 用户名称 */
    name: string;
  
    /** 用户头像 */
    email: string;
  
    /** 创建时间 */
    createAt: string; // 用 string 表示 ISO 日期
  }


  // 用户分页查询参数
export interface UserPageInput {
    /** 关键字 */
    userName: string;
  
    /** 开始时间 */
    startTime?: string; // DateTime? → 可选 string（ISO 日期）
  
    /** 结束时间 */
    endTime?: string; // DateTime? → 可选 string（ISO 日期）
  
    /** 分页 */
    pagination: Pagination;

    /** 账号 */
    account?: string;

    /** 邮箱 */
    email?: string;
  }
  