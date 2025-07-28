/**
 * 用户状态接口
 * 定义了用户的基本信息和认证状态
 */
export interface UserState {
    /** 用户ID，可能为 null */
    userId: number | null;
    
    /** 用户名 */
    userName: string;
    
    /** 用户邮箱 */
    email: string;
    
    /** 用户手机号 */
    account: string;
    
    /** 用户头像URL */
    avatar: string;
    
    /** 用户是否已认证 */
    isAuthenticated: boolean;
  }