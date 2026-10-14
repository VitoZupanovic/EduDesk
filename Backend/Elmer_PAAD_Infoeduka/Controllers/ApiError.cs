using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;

namespace Elmer_PAAD_Infoeduka.Controllers;

public static class ApiError
{
    public static ObjectResult FromException(ControllerBase controller, Exception ex)
    {
        if (IsSqlTimeout(ex))
        {
            return controller.StatusCode(503, new
            {
                message = "Database connection timed out. Please try again in a moment."
            });
        }

        return controller.StatusCode(500, new
        {
            message = "Server error. Please try again later."
        });
    }

    private static bool IsSqlTimeout(Exception ex)
    {
        Exception? current = ex;

        while (current != null)
        {
            if (current is TimeoutException)
                return true;

            if (current is SqlException sqlException && sqlException.Number == -2)
                return true;

            string message = current.Message.ToLowerInvariant();

            if (message.Contains("timeout") || message.Contains("timed out"))
                return true;

            current = current.InnerException;
        }

        return false;
    }
}
