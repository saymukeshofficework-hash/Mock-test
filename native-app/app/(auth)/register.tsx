import React, { useState } from "react";
import { Link } from "expo-router";
import { AuthShell, Field, FormError } from "@/components/AuthShell";
import { Button, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { authErrorKey, signUp } from "@/services/auth";
import { brand } from "@/lib/theme";

export default function Register() {
  const { t } = useT();
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!name.trim() || !id.trim() || !pw) return setErr(t("fillAll"));
    if (pw.length < 6) return setErr(t("passwordShort"));
    setBusy(true);
    setErr(null);
    try {
      const r = await signUp(name, id, pw);
      if (!r.session) setDone(true); // email confirmation needed: the session comes after it
    } catch (e) {
      setErr(t(authErrorKey(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t("register")} subtitle={t("sameAccount")}>
      {done ? (
        <Txt>{t("checkEmail")}</Txt>
      ) : (
        <>
          <Field label={t("fullName")} value={name} onChangeText={setName} autoComplete="name" textContentType="name" />
          <Field label={t("emailOrMobile")} value={id} onChangeText={setId} autoCapitalize="none" keyboardType="email-address" />
          <Field label={t("password")} value={pw} onChangeText={setPw} secureTextEntry autoComplete="new-password" textContentType="newPassword" />
          <FormError text={err} />
          <Button title={t("register")} onPress={submit} loading={busy} />
        </>
      )}
      <Link href="/login" style={{ marginTop: 12, alignSelf: "center" }}><Txt color={brand.blue} w="semibold">{t("haveAccount")}</Txt></Link>
    </AuthShell>
  );
}
