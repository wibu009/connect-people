using Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProfilesController : BaseApiController
    {
        [HttpGet("{username}")]
        public async Task<ActionResult<Profile>> GetProfile(string username)
        {
            return HandleResult(await Mediator.Send(new Details.Query { Username = username }));
        }
    }
}