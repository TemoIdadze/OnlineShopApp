using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using OnlineShop.Application.Mapster;
using OnlineShop.Ge.API.Infrastucture.Auth.JWT;
using OnlineShop.Ge.API.Infrastucture.Extensions;
using OnlineShop.Ge.API.Middlewares;
using OnlineShop.Persistence;
using OnlineShop.Persistence.Context;
using OnlineShop.Persistence.Seed;
using Serilog;
using System.Security.Claims;
using System.Text;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog();  // ? Removed unnecessary 'object value = ' assignment

// Register Mapster mappings
MappingConfig.RegisterMappings();

builder.Services.AddControllers();
builder.Services.AddServices();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(option =>
{
    option.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    });
    option.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Replace your custom AddTokenAuthentication with standard AddJwtBearer
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = "localhost",  // ? Matches your token's "iss"
            ValidateAudience = true,
            ValidAudience = "localhost",  // ? Matches your token's "aud"
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["JWTConfiguration:Secret"]!)),  // ? Use UTF8 and full path from config
            ClockSkew = TimeSpan.FromMinutes(5)  // ? Allow small time differences
        };

        // Add logging for authentication failures (critical for debugging)
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = ctx =>
            {
                Log.Error("JWT Authentication failed: {Message}", ctx.Exception.Message);
                if (ctx.Exception.InnerException != null)
                    Log.Error("Inner exception: {Message}", ctx.Exception.InnerException.Message);
                return Task.CompletedTask;
            },
            OnTokenValidated = ctx =>
            {
                Log.Information("JWT Token validated successfully for user: {UserId}",
                    ctx.Principal?.FindFirstValue("sub"));
                return Task.CompletedTask;
            }
        };
    });

// Keep this for JWTHelper injection
builder.Services.Configure<JWTConfiguration>(builder.Configuration.GetSection(nameof(JWTConfiguration)));

builder.Services.Configure<ConnectionStrings>(builder.Configuration.GetSection(nameof(ConnectionStrings)));

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
if (string.IsNullOrEmpty(connectionString))
{
    throw new InvalidOperationException("DefaultConnection connection string is not configured.");
}

builder.Services.AddDbContext<ShopDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllCors", config =>
    {
        config.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

var app = builder.Build();

try
{
    ShopDbSeed.Initialize(app.Services);
}
catch (Exception ex)
{
    Log.Error(ex, "An error occurred while seeding the database");
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseStaticFiles();
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();

// Move CORS before Authentication
app.UseCors("AllowAllCors");

// Authentication & Authorization after CORS
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapFallbackToFile("index.html");

try
{
    Log.Information("Starting web application...");
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}