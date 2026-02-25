namespace OnlineShop.Ge.API.Infrastucture.Auth.JWT
{
    public class JWTConfiguration
    {
        public string? Secret { get; set; }
        public int ExpirationInMinutes { get; set; }
    }
}
