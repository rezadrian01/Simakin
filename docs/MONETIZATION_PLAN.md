# Simakin - Monetization Plan

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Token System Overview](#2-token-system-overview)
3. [Pricing Strategy](#3-pricing-strategy)
4. [Cost Analysis](#4-cost-analysis)
5. [Payment Integration](#5-payment-integration)
6. [Transaction Flow](#6-transaction-flow)
7. [Revenue Model](#7-revenue-model)
8. [Implementation Details](#8-implementation-details)
9. [Future Enhancements](#9-future-enhancements)

---

## 1. Executive Summary

### 1.1 Business Model

Simakin operates on a **freemium** model with a **token-based** payment system:

| Component | Description |
|-----------|-------------|
| **Free Tier** | 5 tokens on signup |
| **Cost** | 10 tokens per recitation session |
| **Purchase** | Pay-as-you-go token packages via Midtrans |
| **No Subscription** | Pay-per-use (subscription in future) |

### 1.2 Value Proposition

- **For Users**: Affordable AI-powered Quran recitation analysis
- **For Business**: High margin due to efficient API usage (single-pass Gemini)

### 1.3 Revenue Potential

| Metric | Value |
|--------|-------|
| Cost per session (API) | ~Rp 300-500 ($0.02-0.03) |
| Revenue per session | Rp 15,000 (10 tokens) |
| **Margin** | **~30-50x** |

---

## 2. Token System Overview

### 2.1 Token Allocation

| Source | Tokens | Description |
|--------|--------|-------------|
| **Signup (Free)** | 35 | Initial bonus for new users (3-4 sessions) |
| **Recitation Session** | -10 | Deducted per session |
| **Token Purchase** | +N | Buy tokens via payment |
| **Bonus (Future)** | +N | Promotional/gift tokens |

### 2.2 Token Balance

Each user has a `UserToken` record with:

| Field | Type | Description |
|-------|------|-------------|
| `balance` | Int | Current available tokens |
| `totalEarned` | Int | Cumulative earned (free + bonus) |
| `totalSpent` | Int | Cumulative spent on sessions |
| `totalTopup` | Int | Cumulative purchased |

### 2.3 Token Rules

| Rule | Implementation |
|------|-----------------|
| **Expiry** | None (permanent) |
| **Minimum to recite** | Must have ≥10 tokens |
| **Refund** | Not available (unless exceptional) |
| **Transfer** | Not allowed between users |

---

## 3. Pricing Strategy

### 3.1 Token Packages

| Package | Tokens | Price (IDR) | Price (USD) | Cost per Token |
|---------|--------|-------------|-------------|----------------|
| **Starter** | 10 | Rp 15,000 | ~$0.94 | Rp 1,500 |
| **Basic** | 50 | Rp 60,000 | ~$3.75 | Rp 1,200 |
| **Pro** | 100 | Rp 100,000 | ~$6.25 | Rp 1,000 |
| **Premium** | 500 | Rp 400,000 | ~$25.00 | Rp 800 |

### 3.2 Price Comparison

| Metric | Starter | Basic | Pro | Premium |
|--------|---------|-------|-----|---------|
| Sessions included | 1 | 5 | 10 | 50 |
| Price per session | Rp 15,000 | Rp 12,000 | Rp 10,000 | Rp 8,000 |
| Savings vs starter | - | 20% | 33% | 47% |

### 3.3 Psychological Pricing

- **Starter**: Just enough for 1 session (try it out)
- **Basic**: Good value for regular users
- **Pro**: Best value for serious memorizers
- **Premium**: Bulk discount for long-term users

---

## 4. Cost Analysis

### 4.1 API Cost (Per Session)

Based on Gemini pricing analysis:

| Scenario | Cost per Minute | Cost per Session (2-3 min) |
|----------|-----------------|---------------------------|
| Single-pass Gemini | $0.00884 (~Rp 141) | Rp 282-423 |

**Assumptions**:
- Average session: 2-3 minutes
- Using single-pass approach (transcribe + analyze in one call)

### 4.2 Cost vs Revenue Comparison

| Package | Sessions | Revenue | API Cost (est.) | **Profit** |
|---------|----------|---------|-----------------|------------|
| Starter | 1 | Rp 15,000 | Rp 300-500 | **~Rp 14,500** |
| Basic | 5 | Rp 60,000 | Rp 1,500-2,500 | **~Rp 57,500** |
| Pro | 10 | Rp 100,000 | Rp 3,000-5,000 | **~Rp 95,000** |
| Premium | 50 | Rp 400,000 | Rp 15,000-25,000 | **~Rp 375,000** |

### 4.3 Margin Analysis

| Scenario | Margin |
|----------|--------|
| Best case (short session, premium package) | ~50x |
| Worst case (long session, starter package) | ~50x |
| **Average** | **~50-80x** |

> **Note**: Even at worst case, margin is extremely high because API cost is very low compared to token price.

---

## 5. Payment Integration

### 5.1 Midtrans Overview

| Aspect | Details |
|--------|---------|
| **Integration Type** | Snap API (Hosted Payment Page) |
| **Environment** | Sandbox (testing) / Production |
| **Payment Methods** | Bank Transfer, E-Wallet (GoPay, OVO, etc.) |
| **Settlement** | Real-time webhook notification |

### 5.2 Midtrans Configuration

```env
# Environment Variables
MIDTRANS_SERVER_KEY="your_server_key"
MIDTRANS_CLIENT_KEY="your_client_key"
MIDTRANS_IS_PRODUCTION=false
```

### 5.3 Supported Payment Methods

| Method | Type | Notes |
|--------|------|-------|
| Bank Transfer | BCA, BRI, BN I, Mandiri | Virtual account |
| E-Wallet | GoPay, OVO, Dana, LinkAja | Instant |
| Credit Card | Visa, Mastercard, JCB | Future |

---

## 6. Transaction Flow

### 6.1 Purchase Flow Diagram

```
User                    Server                  Midtrans
  │                        │                        │
  │ 1. Select Package      │                        │
  │───────────────────────>│                        │
  │                        │                        │
  │                        │ 2. Create Transaction  │
  │                        │───────────────────────>│
  │                        │                        │
  │                        │<───────────────────────│
  │                        │   (order_id, token)    │
  │                        │                        │
  │ 3. Redirect to Payment │                        │
  │───────────────────────>│                        │
  │     (Midtrans Page)    │                        │
  │                        │                        │
  │ 4. Complete Payment    │                        │
  │───────────────────────>│                        │
  │                        │                        │
  │                        │ 5. Payment Status      │
  │                        │<───────────────────────│
  │                        │   (webhook)            │
  │                        │                        │
  │                        │ 6. Update DB          │
  │                        │───────────────────────│
  │                        │                        │
  │ 7. Success / Tokens Added                       │
  │<───────────────────────│                        │
```

### 6.2 Step-by-Step Process

#### Step 1: User Selects Package
- User navigates to Settings → Token Balance
- Clicks "Top Up" button
- Selects package (Starter/Basic/Pro/Premium)

#### Step 2: Create Midtrans Transaction
```typescript
// Backend creates transaction
const transaction = await prisma.transaction.create({
  data: {
    userId,
    amount: package.tokens,
    type: 'PURCHASE',
    packageName: package.name,
    pricePaid: package.price,
    paymentStatus: 'PENDING',
  }
});

// Request Midtrans token
const midtransResponse = await midtrans.snap.createTransaction({
  transaction_details: {
    order_id: transaction.id,
    gross_amount: package.price,
  },
  customer_details: {
    email: user.email,
    name: user.fullName || user.username,
  },
  item_details: [{
    id: package.id,
    name: package.name,
    price: package.price,
    quantity: 1,
  }],
});
```

#### Step 3: Store Midtrans Details
```typescript
await prisma.transaction.update({
  where: { id: transaction.id },
  data: {
    midtransOrderId: midtransResponse.order_id,
    midtransToken: midtransResponse.token,
    midtransUrl: midtransResponse.redirect_url,
  }
});
```

#### Step 4: Redirect User
```typescript
// Return redirect URL to client
return redirect(midtransResponse.redirect_url);
```

#### Step 5: Payment Completion
User is redirected back to app:
- **Success**: `/app/settings?payment=success`
- **Pending**: `/app/settings?payment=pending`
- **Failed**: `/app/settings?payment=failed`

#### Step 6: Webhook Handling (Critical)
```typescript
// POST /api/payment/webhook
export async function action({ request }: Route.ActionArgs) {
  const body = await request.json();

  // Verify signature
  const signature = generateSignature(
    body.order_id + body.status_code + body.gross_amount
  );

  if (signature !== body.signature_key) {
    return json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Update transaction status
  const status = mapMidtransStatus(body.transaction_status);
  await prisma.transaction.update({
    where: { id: body.order_id },
    data: { paymentStatus: status },
  });

  // If completed, add tokens
  if (status === 'COMPLETED') {
    const transaction = await prisma.transaction.findUnique({
      where: { id: body.order_id },
    });

    await prisma.userToken.update({
      where: { userId: transaction.userId },
      data: {
        balance: { increment: transaction.amount },
        totalTopup: { increment: transaction.amount },
      },
    });
  }

  return json({ success: true });
}
```

### 6.3 Transaction Status Mapping

| Midtrans Status | Our Status | Description |
|-----------------|------------|-------------|
| `settlement` | COMPLETED | Payment successful |
| `capture` | COMPLETED | Payment captured |
| `pending` | PENDING | Awaiting payment |
| `expire` | EXPIRED | Payment expired |
| `deny` | FAILED | Payment denied |
| `cancel` | CANCELLED | Payment cancelled |

---

## 7. Revenue Model

### 7.1 Revenue Streams

| Stream | Description | Status |
|--------|-------------|--------|
| **Token Purchase** | Primary revenue from token packages | Implementation |
| **Promotional** | Bundle deals, discounts (future) | Future |
| **Subscription** | Monthly token bundles (future) | Future |

### 7.2 Projected Revenue (MVP)

Assumptions:
- 100 registered users
- 30% active monthly (30 users)
- Average 5 sessions/month per active user
- 50% purchase tokens after free tier

| Metric | Monthly |
|--------|---------|
| Active users | 30 |
| Total sessions | 150 |
| Free sessions (from signup) | 100 (5×20 users) |
| Paid sessions | 50 |
| Revenue (average) | Rp 1,250,000 |

### 7.3 Growth Projections

| Month | Users | Active | Revenue (est.) |
|-------|-------|--------|---------------|
| 1 | 100 | 30 | Rp 1,125,000 |
| 3 | 500 | 150 | Rp 5,625,000 |
| 6 | 2,000 | 600 | Rp 22,500,000 |
| 12 | 10,000 | 3,000 | Rp 112,500,000 |

> Note: Revenue estimates account for free tier usage. Actual revenue may vary based on token package mix.

---

## 8. Implementation Details

### 8.1 Database Schema (Token & Transaction)

```prisma
model UserToken {
  id           String @id @default(cuid())
  user         User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId       String @unique
  balance      Int    @default(0)
  totalEarned  Int    @default(0)
  totalSpent   Int    @default(0)
  totalTopup   Int    @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Transaction {
  id              String        @id @default(cuid())
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId          String

  amount          Int
  type            TransactionType
  paymentMethod   String?
  paymentStatus   PaymentStatus @default(PENDING)

  midtransOrderId String?
  midtransToken   String?
  midtransUrl     String?

  packageName     String?
  pricePaid       Int?

  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([userId])
  @@index([midtransOrderId])
  @@index([paymentStatus])
}

enum TransactionType {
  PURCHASE
  EARNED
  REFUND
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  EXPIRED
  CANCELLED
}
```

### 8.2 Token Deduction Flow

```typescript
// In recitation session action
export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  // 1. Check token balance
  const userToken = await prisma.userToken.findUnique({
    where: { userId },
  });

  if (!userToken || userToken.balance < 10) {
    return json(
      { error: 'Insufficient tokens. Please top up first.' },
      { status: 400 }
    );
  }

  // 2. Process audio with Gemini (transcribe + validate)
  // ... (existing logic)

  // 3. Deduct tokens (in same transaction as recitation)
  await prisma.$transaction([
    prisma.userToken.update({
      where: { userId },
      data: {
        balance: { decrement: 10 },
        totalSpent: { increment: 10 },
      },
    }),
    prisma.recitation.create({ /* ... */ }),
    prisma.feedback.create({ /* ... */ }),
  ]);

  // 4. Return success
  return json({ success: true, recitationId });
}
```

### 8.3 Token Purchase API

```typescript
// POST /api/token/purchase
export async function action({ request }: Route.ActionArgs) {
  const userId = await requireUserId(request);
  const formData = await request.formData();

  const packageId = formData.get('packageId') as string;
  const package = TOKEN_PACKAGES.find(p => p.id === packageId);

  if (!package) {
    return json({ error: 'Invalid package' }, { status: 400 });
  }

  // Create transaction
  const transaction = await prisma.transaction.create({
    data: {
      userId,
      amount: package.tokens,
      type: 'PURCHASE',
      packageName: package.name,
      pricePaid: package.price,
      paymentStatus: 'PENDING',
    },
  });

  // Create Midtrans token
  const midtrans = new MidtransClient({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY,
  });

  const snapResponse = await midtrans.snap.createTransaction({
    transaction_details: {
      order_id: transaction.id,
      gross_amount: package.price,
    },
    customer_details: {
      email: (await getUserById(userId)).email,
    },
    item_details: [{
      id: package.id,
      name: `${package.name} - ${package.tokens} Tokens`,
      price: package.price,
      quantity: 1,
    }],
  });

  // Update transaction with Midtrans details
  await prisma.transaction.update({
    where: { id: transaction.id },
    data: {
      midtransOrderId: snapResponse.order_id,
      midtransToken: snapResponse.token,
      midtransUrl: snapResponse.redirect_url,
    },
  });

  return json({ paymentUrl: snapResponse.redirect_url });
}
```

### 8.4 Webhook Handler

```typescript
// POST /api/payment/webhook
export async function action({ request }: Route.ActionArgs) {
  const signature = request.headers.get('x-midtrans-signature');

  // Verify webhook signature
  // ...

  const { order_id, transaction_status, gross_amount } = body;

  // Find transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: order_id },
  });

  if (!transaction) {
    return json({ error: 'Transaction not found' }, { status: 404 });
  }

  // Map status
  const statusMap: Record<string, PaymentStatus> = {
    'settlement': 'COMPLETED',
    'capture': 'COMPLETED',
    'pending': 'PENDING',
    'expire': 'EXPIRED',
    'deny': 'FAILED',
    'cancel': 'CANCELLED',
  };

  const newStatus = statusMap[transaction_status] || 'FAILED';

  // Update transaction
  await prisma.transaction.update({
    where: { id: order_id },
    data: { paymentStatus: newStatus },
  });

  // Add tokens if completed
  if (newStatus === 'COMPLETED') {
    await prisma.userToken.update({
      where: { userId: transaction.userId },
      data: {
        balance: { increment: transaction.amount },
        totalTopup: { increment: transaction.amount },
      },
    });

    // Optionally: Send notification email
  }

  return json({ success: true });
}
```

### 8.5 Frontend Token UI

```tsx
// Token balance display component
export function TokenBalance() {
  const { userToken } = useLoaderData<typeof loader>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">{userToken.balance}</div>
        <p className="text-muted-foreground">tokens remaining</p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {TOKEN_PACKAGES.map((pkg) => (
            <Button
              key={pkg.id}
              variant="outline"
              onClick={() => handlePurchase(pkg.id)}
            >
              {pkg.name} - {pkg.tokens} tokens
              <br />
              Rp {pkg.price.toLocaleString()}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 9. Future Enhancements

### 9.1 Subscription Plans (v1.2)

| Plan | Tokens/Month | Price (IDR) | Per Token |
|------|--------------|-------------|-----------|
| Basic Monthly | 30 | Rp 80,000 | Rp 2,667 |
| Premium Monthly | 100 | Rp 200,000 | Rp 2,000 |
| Family Monthly | 300 | Rp 500,000 | Rp 1,667 |

### 9.2 Promotional Features

| Feature | Description |
|---------|-------------|
| Referral Bonus | Give 5 tokens for each friend who signs up |
| First Purchase Bonus | Double tokens on first purchase |
| Streak Rewards | Bonus tokens for consistent usage |

### 9.3 Alternative Payment Methods

| Method | Implementation |
|--------|-----------------|
| QRIS | National QR standard |
| Pulsa | Mobile credit deduction |
| Alfamart/Indomaret | Convenience store payment |

---

## Appendix

### A. Token Packages Configuration

```typescript
const TOKEN_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    tokens: 10,
    price: 25000,
    description: 'Perfect for trying out',
  },
  {
    id: 'basic',
    name: 'Basic',
    tokens: 50,
    price: 100000,
    description: 'Good for regular practice',
  },
  {
    id: 'pro',
    name: 'Pro',
    tokens: 100,
    price: 180000,
    description: 'Best value for serious users',
  },
  {
    id: 'premium',
    name: 'Premium',
    tokens: 500,
    price: 750000,
    description: 'Bulk tokens for long-term',
  },
];
```

### B. Environment Variables

```env
# Midtrans
MIDTRANS_SERVER_KEY="your_server_key"
MIDTRANS_CLIENT_KEY="your_client_key"
MIDTRANS_IS_PRODUCTION=false
```

### C. Testing Checklist

- [ ] Sandbox payment flow works
- [ ] Webhook updates transaction status
- [ ] Tokens added on successful payment
- [ ] Failed payment handled correctly
- [ ] Token balance updates in real-time
- [ ] Edge cases: duplicate webhook, invalid signature

---

## Summary

| Aspect | Value |
|--------|-------|
| Free tokens on signup | 35 tokens (3-4 sessions) |
| Cost per session | 10 tokens |
| Pricing range | Rp 15,000 - Rp 400,000 |
| API cost per session | ~Rp 300-500 |
| Average margin | ~30-50x |
| Payment gateway | Midtrans |
| Model | Pay-as-you-go (no subscription) |

---

*Document Version: 1.0*
*Last Updated: 2026-03-15*
*Project: Simakin - Gamified Al-Quran Memorization Platform*