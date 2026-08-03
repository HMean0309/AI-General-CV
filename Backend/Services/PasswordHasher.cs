using System.Security.Cryptography;
using System.Text;

namespace TayDoApi.Services
{
    /// <summary>
    /// Băm mật khẩu bằng HMACSHA512: PasswordSalt = key ngẫu nhiên của HMAC,
    /// PasswordHash = base64(HMACSHA512(salt, password)).
    /// LƯU Ý: đây là thuật toán mặc định được dùng khi TẠO user mới qua API này.
    /// Nếu hệ thống gốc (đã sinh ra dữ liệu trong TayDoV2.bak) dùng thuật toán băm khác,
    /// các tài khoản cũ sẽ KHÔNG đăng nhập được cho tới khi đổi mật khẩu qua API này,
    /// hoặc bạn sửa lại PasswordHasher này cho khớp thuật toán gốc.
    /// </summary>
    public class PasswordHasher
    {
        public (string hash, byte[] salt) HashPassword(string password)
        {
            using var hmac = new HMACSHA512();
            var salt = hmac.Key;
            var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return (Convert.ToBase64String(hashBytes), salt);
        }

        public bool VerifyPassword(string password, string storedHash, byte[] storedSalt)
        {
            if (storedSalt == null || storedSalt.Length == 0) return false;
            using var hmac = new HMACSHA512(storedSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(computedHash) == storedHash;
        }
    }
}
