using Microsoft.AspNetCore.Identity;
using OnlineShop.Domain.Users;
using System.Security.Cryptography;
using System.Text;

namespace OnlineShop.Application.Users
{
    public class CustomPasswordHasher : IPasswordHasher<User>
    {
        private static readonly string SECRET_KEY = "123";
        public string HashPassword(User user, string password)
        {
            return GenerateHash(password);
        }

        public PasswordVerificationResult VerifyHashedPassword(User user, string hashedPassword, string providedPassword)
        {
            if (hashedPassword == GenerateHash(providedPassword))
            {
                return PasswordVerificationResult.Success;
            }

            return PasswordVerificationResult.Failed;
        }
        public static string GenerateHash(string input)
        {
            using SHA512 sha = SHA512.Create();
            byte[] bytes = Encoding.ASCII.GetBytes(input + SECRET_KEY);
            byte[] hashBytes = sha.ComputeHash(bytes);

            StringBuilder sb = new();

            for (int i = 0; i < hashBytes.Length; i++)
            {
                sb.Append(hashBytes[i].ToString("X2"));
            }

            return sb.ToString();
        }
    }

}
