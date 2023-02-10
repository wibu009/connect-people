using Application.Activities;
using Application.Core;
using Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API
{
    public class ActivitiesController : BaseApiController
    {
        [HttpGet]
        public async Task<IActionResult> GetActivities(
            [FromQuery] ActivityParams param,
            CancellationToken ct)
        {
            return HandlePagedResult(await Mediator.Send(new List.Query { Params = param }, ct));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetActivity(Guid id, CancellationToken ct)
        {
            return HandleResult(await Mediator.Send(new Details.Query { Id = id }, ct));
        }

        [HttpPost]
        public async Task<IActionResult> CreateActivity(Activity activity, CancellationToken ct)
        {
            return HandleResult(await Mediator.Send(new Create.Command { Activity = activity }, ct));
        }

        [Authorize(Policy = "IsActivityHost")]
        [HttpPut("{id}")]
        public async Task<IActionResult> EditActivity(Guid id, Activity activity, CancellationToken ct)
        {
            activity.Id = id;
            return HandleResult(await Mediator.Send(new Edit.Command { Activity = activity }, ct));
        }

        [Authorize(Policy = "IsActivityHost")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteActivity(Guid id, CancellationToken ct)
        {
            return HandleResult(await Mediator.Send(new Delete.Command { Id = id }, ct));
        }

        [HttpPost("{id}/attend")]
        public async Task<IActionResult> Attend(Guid id, CancellationToken ct)
        {
            return HandleResult(await Mediator.Send(new UpdateAttendance.Command { Id = id }, ct));
        }
    }
}