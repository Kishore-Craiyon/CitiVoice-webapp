// src/lib/permissions.ts
export class PermissionService {
  static canViewAllReports(userRole: string): boolean {
    return userRole === 'ADMIN'
  }

  static canViewDepartmentReports(userRole: string): boolean {
    return ['ADMIN', 'DEPARTMENT_HEAD'].includes(userRole)
  }

  static canAssignReports(userRole: string): boolean {
    return ['ADMIN', 'DEPARTMENT_HEAD'].includes(userRole)
  }

  static canManageUsers(userRole: string): boolean {
    return userRole === 'ADMIN'
  }

  static canManageDepartments(userRole: string): boolean {
    return userRole === 'ADMIN'
  }

  static canUpdateReportStatus(userRole: string): boolean {
    return ['ADMIN', 'DEPARTMENT_HEAD', 'STAFF'].includes(userRole)
  }

  static canViewAnalytics(userRole: string): boolean {
    return ['ADMIN', 'DEPARTMENT_HEAD'].includes(userRole)
  }
}
