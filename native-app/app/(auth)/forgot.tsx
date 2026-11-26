import React, { useState } from "react";
import { Link } from "expo-router";
import { AuthShell, Field, FormError } from "@/components/AuthShell";
import { Button, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { authErrorKey, sendPasswordReset } from "@/services/auth";
import { brand } from "@/lib/theme";

export default function Forgot() {
  const { t } = useT();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.includes("@")) return setErr(t("enterEmail"));
    setBusy(true);
    setErr(null);
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (e) {
      setErr(t(authErrorKey(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t("forgot")} subtitle={t("resetHelp")}>
      {sent ? <Txt>{t("resetSent")}</Txt> : (
        <>
          <Field label={t("email")} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
          <FormError text={err} />
          <Button title={t("sendReset")} onPress={submit} loading={busy} />
        </>
      )}
      <Link href="/login" style={{ marginTop: 12, alignSelf: "center" }}><Txt color={brand.blue} w="semibold">{t("haveAccount")}</Txt></Link>
    </AuthShell>
  );
}
