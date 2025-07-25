# DNS Configuration Guide for vtchat.io.vn

## 🎯 Goal

Configure DNS to point `vtchat.io.vn` → `vtchat.fly.dev` for production deployment.

## 📋 Current Status

- **Domain**: vtchat.io.vn (purchased from matbao.net)
- **Fly App**: vtchat (production)
- **Certificate**: Created, awaiting DNS configuration
- **Target**: vtchat.fly.dev

## 🔧 DNS Configuration Steps

### Option 1: CNAME Record (Recommended)

**Add this CNAME record at your DNS provider (Matbao):**

```
Type: CNAME
Name: vtchat.io.vn (or @ for root domain)
Value: vtchat.fly.dev
TTL: 300 (5 minutes)
```

### Option 2: A Records (If CNAME not supported for root domain)

If your DNS provider doesn't support CNAME for root domains, use A records:

```bash
# Get Fly.io IP addresses
dig vtchat.fly.dev

# Add these A records:
Type: A
Name: @ (root domain)
Value: [Fly.io IP addresses]
TTL: 300
```

## 🏢 DNS Provider Instructions

### For Matbao.net Users:

1. **Login to Matbao Control Panel**
    - Go to: https://matbao.net
    - Login with your account credentials

2. **Navigate to DNS Management**
    - Find "Quản lý tên miền" (Domain Management)
    - Select vtchat.io.vn
    - Go to "Quản lý DNS" (DNS Management)

3. **Add CNAME Record**

    ```
    Loại bản ghi (Record Type): CNAME
    Tên (Name): @ hoặc vtchat.io.vn
    Giá trị (Value): vtchat.fly.dev
    TTL: 300
    ```

4. **Save Changes**
    - Click "Lưu" or "Cập nhật" (Save/Update)
    - DNS propagation takes 5-60 minutes

## ✅ Verification Steps

### 1. Check Fly Certificate Status

```bash
fly certs show vtchat.io.vn
```

### 2. Verify DNS Propagation

```bash
# Check CNAME record
dig vtchat.io.vn CNAME

# Check if domain resolves
curl -I https://vtchat.io.vn
```

### 3. Validate Certificate

```bash
fly certs check vtchat.io.vn
```

## 📱 Expected Results

**Before DNS Configuration:**

```bash
❯ fly certs show vtchat.io.vn
Certificate Status: Awaiting DNS configuration
```

**After DNS Configuration:**

```bash
❯ fly certs show vtchat.io.vn
Certificate Status: Ready
Issued by: Let's Encrypt
```

## 🚀 Post-Configuration

Once DNS is configured and certificate is ready:

1. **Test Production Domain**

    ```bash
    curl -I https://vtchat.io.vn
    ```

2. **Update Application URLs**
    - Verify all references to vtchat.fly.dev in production
    - Update any hardcoded URLs if needed

3. **Deploy with Custom Domain**
    ```bash
    ./deploy-fly.sh --clean --prod
    ```

## 🔍 Troubleshooting

### DNS Not Propagating

- Wait 5-60 minutes for DNS propagation
- Use different DNS checkers: https://dnschecker.org
- Clear local DNS cache: `sudo dscacheutil -flushcache`

### Certificate Issues

```bash
# Delete and recreate certificate
fly certs delete vtchat.io.vn
fly certs create vtchat.io.vn
```

### CNAME vs A Records

- **CNAME**: Points domain to another domain (recommended)
- **A Records**: Points domain to IP addresses (backup option)

## 📞 Support

**DNS Issues:**

- Matbao Support: https://matbao.net/lien-he
- Documentation: Check Matbao DNS management guide

**Fly.io Issues:**

- Fly Support: https://fly.io/docs/getting-started/troubleshooting/
- Community: https://community.fly.io

---

**Next Step**: Configure DNS CNAME record at Matbao.net dashboard.
