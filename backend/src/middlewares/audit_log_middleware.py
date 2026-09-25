async def audit_log_middleware(request, call_next):
    """请求级访问日志；业务操作日志由 AuditLogService 落库。"""
    if not request.url.path.startswith(("/health", "/docs", "/openapi.json")):
        print("audit", request.method, request.url.path)
    return await call_next(request)
