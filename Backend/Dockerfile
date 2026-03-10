FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["OnlineShop.Ge.API/OnlineShop.Ge.API.csproj", "OnlineShop.Ge.API/"]
COPY ["OnlineShop.Application/OnlineShop.Application.csproj", "OnlineShop.Application/"]
COPY ["OnlineShop.Domain/OnlineShop.Domain.csproj", "OnlineShop.Domain/"]
COPY ["OnlineShop.Infrastructure/OnlineShop.Infrastructure.csproj", "OnlineShop.Infrastructure/"]
COPY ["OnlineShop.Persistence/OnlineShop.Persistence.csproj", "OnlineShop.Persistence/"]
RUN dotnet restore "OnlineShop.Ge.API/OnlineShop.Ge.API.csproj"
COPY . .
WORKDIR "/src/OnlineShop.Ge.API"
RUN dotnet publish -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "OnlineShop.Ge.API.dll"]
ENV ASPNETCORE_ENVIRONMENT=Production