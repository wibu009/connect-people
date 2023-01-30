using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security
{
    public class IsHostRequirement : IAuthorizationRequirement
    {

    }

    public class IsHostRequirementHandler : AuthorizationHandler<IsHostRequirement>
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly DataContext _dbContext;

        public IsHostRequirementHandler(DataContext dbContext, IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
            _dbContext = dbContext;
        }

        protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
        {
            // get the current user id
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

            // if the user id is null, return
            if (userId == null) return Task.CompletedTask;

            // get the activity id
            var activityId = Guid.Parse(_httpContextAccessor.HttpContext.Request.RouteValues
            .SingleOrDefault(x => x.Key == "id").Value.ToString());

            // get the attendee
            var attendee = _dbContext.ActivityAttendees
            .AsNoTracking()
            .SingleOrDefaultAsync(x => x.AppUserId == userId && x.ActivityId == activityId).Result;

            // if the attendee is null, return
            if (attendee == null) return Task.CompletedTask;

            // if the attendee is a host, succeed the context
            if (attendee.IsHost) context.Succeed(requirement);

            // return
            return Task.CompletedTask;
        }
    }
}