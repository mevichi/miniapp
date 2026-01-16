import crypto from "crypto";

export function verifyTelegram(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash")!;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort()
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");

  const secret = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computedHash = crypto.createHmac("sha256", secret).update(dataCheckString).digest("hex");

  return computedHash === hash;
}
