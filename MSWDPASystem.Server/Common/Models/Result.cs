namespace MSWDPASystem.Server.Common.Models;

public class Result<T>
{
    public bool IsSuccess { get; private init; }
    public T? Data { get; private init; }
    public string? Error { get; private init; }
    public List<string> Errors { get; private init; } = [];

    public static Result<T> Success(T data) => new() { IsSuccess = true, Data = data };
    public static Result<T> Failure(string error) => new() { IsSuccess = false, Error = error };
    public static Result<T> Failure(List<string> errors) => new() { IsSuccess = false, Errors = errors, Error = errors.FirstOrDefault() };
}

public class Result
{
    public bool IsSuccess { get; private init; }
    public string? Error { get; private init; }
    public List<string> Errors { get; private init; } = [];

    public static Result Success() => new() { IsSuccess = true };
    public static Result Failure(string error) => new() { IsSuccess = false, Error = error };
    public static Result Failure(List<string> errors) => new() { IsSuccess = false, Errors = errors, Error = errors.FirstOrDefault() };
}
