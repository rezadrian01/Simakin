# Analisis: Cross-Method Authentication

## 📋 Skenario yang Dianalisis

### Skenario 1: Signup Google → Login Email/Password
**User signup menggunakan Google, kemudian mencoba login menggunakan email/password**

### Skenario 2: Signup Email/Password → Login Google
**User signup menggunakan email/password, kemudian mencoba login menggunakan Google**

---

## 🔍 Analisis Kode Saat Ini

### Skenario 1: Signup Google → Login Email/Password

#### Apa yang Terjadi:
1. **Signup via Google:**
   ```typescript
   // handleGoogleAuth() creates user dengan:
   {
     email: "user@gmail.com",
     username: "user",
     fullName: "User Name",
     avatarUrl: "https://...",
     passwordHash: null  // ← TIDAK ADA PASSWORD!
   }
   ```

2. **Login via Email/Password:**
   ```typescript
   // signin() function:
   const user = await db.user.findFirst({
     where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] }
   });
   // ✅ User ditemukan!
   
   const isCorrectPassword = await bcrypt.compare(password, user.passwordHash ?? "");
   // ❌ MASALAH: passwordHash = null
   // bcrypt.compare(password, "") akan selalu return false
   // Return: null (Login GAGAL)
   ```

#### Hasil:
- ❌ **User TIDAK BISA login**
- ❌ Error message: "Invalid email or password"
- ❌ User bingung kenapa tidak bisa login padahal emailnya benar

#### Masalah:
- User yang signup via Google tidak punya password
- Sistem menolak login tapi tidak memberikan informasi yang jelas
- User tidak tahu bahwa dia harus login via Google

---

### Skenario 2: Signup Email/Password → Login Google

#### Apa yang Terjadi:
1. **Signup via Email/Password:**
   ```typescript
   // signup() creates user dengan:
   {
     email: "user@gmail.com",
     username: "userchosen",
     fullName: "User Name",
     passwordHash: "$2a$10$..." // ✅ Ada password hash
   }
   ```

2. **Login via Google:**
   ```typescript
   // handleGoogleAuth():
   let user = await db.user.findUnique({ where: { email } });
   // ✅ User ditemukan!
   
   if (!user) {
     // Tidak dijalankan karena user sudah ada
   } else {
     // ✅ Update avatar jika berbeda
     if (avatarUrl && user.avatarUrl !== avatarUrl) {
       user = await db.user.update({
         where: { id: user.id },
         data: { avatarUrl }
       });
     }
   }
   // ✅ Return user data
   // ✅ Login BERHASIL!
   ```

#### Hasil:
- ✅ **User BISA login**
- ✅ Login berhasil via Google
- ✅ Avatar diupdate dari Google (bonus!)
- ✅ User sekarang bisa login via kedua metode

---

## 🎯 Solusi yang Disarankan

### Pendekatan 1: **Allow Multiple Auth Methods** (Recommended)

User dapat login menggunakan metode apapun setelah akun terbuat.

#### Implementasi:

**1. Update `signin()` function:**
```typescript
export async function signin({
  emailOrUsername,
  password,
}: {
  emailOrUsername: string;
  password: string;
}) {
  const user = await db.user.findFirst({
    where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
  });

  if (!user) return null;

  // Check if user has no password (Google OAuth user)
  if (!user.passwordHash) {
    return { 
      error: "OAUTH_ACCOUNT",
      message: "Akun ini didaftarkan menggunakan Google. Silakan masuk dengan Google."
    };
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    user.passwordHash
  );
  
  if (!isCorrectPassword) return null;

  return { id: user.id, email: user.email };
}
```

**2. Update Signin UI untuk handle error:**
```typescript
// signin/index.tsx
const result = await signin({ emailOrUsername, password });

if (!result) {
  return { error: "Email atau password salah" };
}

if ('error' in result && result.error === 'OAUTH_ACCOUNT') {
  return { 
    error: result.message,
    googleOnly: true 
  };
}
```

**3. Tambah fitur "Set Password" untuk OAuth users:**
```typescript
// Buat route /app/settings/security
export async function setPassword({
  userId,
  newPassword,
}: {
  userId: string;
  newPassword: string;
}) {
  const user = await db.user.findUnique({ where: { id: userId } });
  
  if (!user) throw new Error("User not found");
  
  // Allow setting password for OAuth users
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  await db.user.update({
    where: { id: userId },
    data: { passwordHash }
  });
}
```

---

### Pendekatan 2: **Link Accounts (Advanced)**

Merge akun jika email sama tapi metode berbeda.

#### Implementasi:

**1. Update schema.prisma:**
```prisma
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  username     String   @unique
  fullName     String?
  passwordHash String?
  avatarUrl    String?
  
  // Auth method tracking
  authMethods  String[] // ["EMAIL", "GOOGLE", "FACEBOOK"]
  
  // ...rest of fields
}
```

**2. Update `handleGoogleAuth()`:**
```typescript
export async function handleGoogleAuth({
  email,
  fullName,
  avatarUrl,
}: {
  email: string;
  fullName: string;
  avatarUrl?: string;
}) {
  let user = await db.user.findUnique({ where: { email } });

  if (!user) {
    // Create new user with Google auth
    const baseUsername = email.split("@")[0];
    let username = baseUsername;
    let counter = 1;

    while (await db.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    user = await db.user.create({
      data: {
        email,
        username,
        fullName,
        avatarUrl,
        passwordHash: null,
        authMethods: ["GOOGLE"] // Track auth method
      },
    });
  } else {
    // User exists - add Google to auth methods if not already there
    const authMethods = user.authMethods || [];
    if (!authMethods.includes("GOOGLE")) {
      user = await db.user.update({
        where: { id: user.id },
        data: { 
          avatarUrl,
          authMethods: [...authMethods, "GOOGLE"]
        }
      });
    } else if (avatarUrl && user.avatarUrl !== avatarUrl) {
      user = await db.user.update({
        where: { id: user.id },
        data: { avatarUrl }
      });
    }
  }

  return { id: user.id, email: user.email };
}
```

**3. Update `signup()`:**
```typescript
export async function signup({
  email,
  password,
  username,
  fullName,
}: {
  email: string;
  password: string;
  username: string;
  fullName: string;
}) {
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      username,
      fullName,
      authMethods: ["EMAIL"] // Track auth method
    },
  });

  return { id: user.id, email: user.email };
}
```

---

## 📊 Comparison Matrix

| Skenario | Status Saat Ini | Pendekatan 1 | Pendekatan 2 |
|----------|----------------|--------------|--------------|
| Google → Email/Password | ❌ Gagal | ⚠️ Error informatif + opsi set password | ✅ Berhasil (auto-link) |
| Email/Password → Google | ✅ Berhasil | ✅ Berhasil | ✅ Berhasil + tracking |
| User Experience | 😕 Bingung | 😊 Jelas | 😄 Seamless |
| Kompleksitas | Low | Medium | High |
| Fleksibilitas | Low | High | Very High |

---

## 🎯 Rekomendasi

### Short-term (Quick Fix):
**Implementasi Pendekatan 1** - Tambah validasi di `signin()` untuk detect OAuth accounts dan berikan error message yang informatif.

### Long-term (Better UX):
**Implementasi Pendekatan 2** - Track auth methods dan allow account linking untuk pengalaman yang lebih baik.

### Immediate Action Items:

1. ✅ **Fix `signin()` untuk OAuth users**
   - Detect `passwordHash === null`
   - Return error informatif
   - Guide user untuk login via Google

2. ✅ **Update UI untuk show error yang jelas**
   - Show "Login dengan Google" button jika OAuth account
   - Atau redirect otomatis ke Google OAuth

3. ✅ **Tambah "Set Password" feature**
   - Allow OAuth users untuk set password
   - Sehingga bisa login via kedua metode

4. 📝 **Documentation**
   - Update user docs tentang multiple auth methods
   - Add FAQ tentang "lupa metode login"

---

## 🔒 Security Considerations

1. **Email Verification**: Pastikan email terverifikasi sebelum link accounts
2. **Password Strength**: Enforce password policy saat set password
3. **Session Management**: Invalidate sessions saat change auth methods
4. **Audit Log**: Track auth method changes untuk security

---

## 📝 User Flow Examples

### Flow 1: OAuth User Tries Email/Password Login
```
1. User signup via Google ✅
2. User mencoba login via email/password ❌
3. System shows: "Akun ini terdaftar via Google. Klik di sini untuk login dengan Google" 
4. User click button → redirect to Google OAuth ✅
5. Login berhasil ✅
```

### Flow 2: Email User Wants to Add Google Login
```
1. User signup via email/password ✅
2. User goes to Settings → Connected Accounts
3. User clicks "Connect Google Account"
4. Google OAuth → account linked ✅
5. User sekarang bisa login via Google atau email/password ✅
```

---

## 🧪 Testing Scenarios

- [ ] Signup Google → Login Email/Password (should show clear error)
- [ ] Signup Email/Password → Login Google (should succeed)
- [ ] OAuth user sets password → Login Email/Password (should succeed)
- [ ] Same email different method → Account linking (should merge)
- [ ] Security: Prevent unauthorized account linking
- [ ] UI: Error messages are clear and helpful
