namespace MSWDPASystem.Server.Common.Exceptions;

public class AppException : Exception
{
    public AppException(string message) : base(message) { }
}

public class NotFoundException : AppException
{
    public NotFoundException(string entityName, object key)
        : base($"{entityName} with identifier '{key}' was not found.") { }

    public NotFoundException(string message) : base(message) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "You are not authorized to perform this action.")
        : base(message) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message) : base(message) { }
}
