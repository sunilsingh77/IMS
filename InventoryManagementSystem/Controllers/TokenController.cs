﻿using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using InventoryManagementSystem.Helpers;
using InventoryManagementSystem.Data.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace InventoryManagementSystem.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TokenController : ControllerBase
    {
        // jwt and refresh tokens
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppSettings _appSettings;
        private readonly Token _token;
        private readonly ApplicationDBContext _db;

        public TokenController(UserManager<ApplicationUser> userManager,
            IOptions<AppSettings> appSettings,
            Token token,
            ApplicationDBContext db)
        {
            _userManager = userManager;
            _appSettings = appSettings.Value;
            _token = token;
            _db = db;
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> Auth([FromBody] TokenRequest model) // granttype = "refresh_token"
        {
            // We will return Generic 500 HTTP Server Status Error
            // If we receive an invalid payload
            if (model == null)
            {
                return new StatusCodeResult(500);
            }

            switch (model.GrantType)
            {
                case "password":
                    return await GenerateNewToken(model);
                case "refresh_token":
                    return await RefreshToken(model);
                default:
                    // not supported - return a HTTP 401 (Unauthorized)
                    return new UnauthorizedResult();
            }
        }

        // Method to Create New JWT and Refresh Token
        private async Task<IActionResult> GenerateNewToken(TokenRequest model)
        {
            // check if there's an user with the given username
            var user = await _userManager.FindByNameAsync(model.UserName);

            // Validate credentials
            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                //// If the user has confirmed his email
                //if (!await _userManager.IsEmailConfirmedAsync(user))
                //{
                //    ModelState.AddModelError(string.Empty, "User Has not Confirmed Email.");

                //    return Unauthorized(new { LoginError = "We sent you an Confirmation Email. Please Confirm Your Registration With DIARSOTECHNOLOGIES.COM To Log in." });
                //}

                // username & password matches: create the refresh token
                var newRtoken = CreateRefreshToken(_appSettings.ClientId, user.Id);

                // first we delete any existing old refreshtokens
                var oldrTokens = _db.Tokens.Where(rt => rt.UserId == user.Id);

                if (oldrTokens != null)
                {
                    foreach (var oldrt in oldrTokens)
                    {
                        _db.Tokens.Remove(oldrt);
                    }

                }

                // Add new refresh token to Database
                _db.Tokens.Add(newRtoken);

                await _db.SaveChangesAsync();

                // Create & Return the access token which contains JWT and Refresh Token
                var accessToken = await CreateAccessToken(user, newRtoken.Value);


                return Ok(new { authToken = accessToken });

            }

            ModelState.AddModelError("", "Username/Password was not Found");
            return Unauthorized(new { LoginError = "Please Check the Login Credentials - Ivalid Username/Password was entered" });


        }

        // Create access Tokenm
        private async Task<TokenResponse> CreateAccessToken(ApplicationUser user, string refreshToken)
        {
            double tokenExpiryTime = Convert.ToDouble(_appSettings.ExpireTime);
            var key = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(_appSettings.Secret));
            var tokenHandler = new JwtSecurityTokenHandler();

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                    {
                        new Claim(JwtRegisteredClaimNames.Sub, user.UserName),
                        new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                        new Claim(ClaimTypes.NameIdentifier, user.Id),
                        new Claim("LoggedOn", DateTime.Now.ToString()),
                     }),

                SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature),
                Issuer = _appSettings.Site,
                Audience = _appSettings.Audience,
                Expires = DateTime.UtcNow.AddMinutes(tokenExpiryTime)
            };

            // Generate token
            var newtoken = tokenHandler.CreateToken(tokenDescriptor);
            var encodedToken = tokenHandler.WriteToken(newtoken);

            return new TokenResponse()
            {
                Token = encodedToken,
                Expiration = newtoken.ValidTo,
                Refresh_Token = refreshToken,
                UserName = user.UserName
            };
        }

        private Token CreateRefreshToken(string clientId, string userId)
        {
            return new Token()
            {
                ClientId = clientId,
                UserId = userId,
                Value = Guid.NewGuid().ToString("N"),
                CreatedDate = DateTime.UtcNow,
                ExpiryTime = DateTime.UtcNow.AddMinutes(90)
            };
        }

        // Method to Refresh JWT and Refresh Token
        private async Task<IActionResult> RefreshToken(TokenRequest model)
        {
            try
            {
                // check if the received refreshToken exists for the given clientId
                var rt = _db.Tokens.FirstOrDefault(t => t.ClientId == _appSettings.ClientId && t.Value == model.RefreshToken.ToString());

                if (rt == null)
                {
                    // refresh token not found or invalid (or invalid clientId)
                    return new UnauthorizedResult();
                }

                // check if refresh token is expired
                if (rt.ExpiryTime < DateTime.UtcNow)
                {
                    return new UnauthorizedResult();
                }

                // check if there's an user with the refresh token's userId
                var user = await _userManager.FindByIdAsync(rt.UserId);

                if (user == null)
                {
                    // UserId not found or invalid
                    return new UnauthorizedResult();
                }

                // generate a new refresh token
                var rtNew = CreateRefreshToken(rt.ClientId, rt.UserId);

                // invalidate the old refresh token (by deleting it)
                _db.Tokens.Remove(rt);

                // add the new refresh token
                _db.Tokens.Add(rtNew);

                // persist changes in the DB
                _db.SaveChanges();

                var response = await CreateAccessToken(user, rtNew.Value);

                return Ok(new { authToken = response });
            }
            catch (Exception ex)
            {
                return new UnauthorizedResult();
            }
        }

    }
}