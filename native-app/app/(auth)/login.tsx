import React, { useState } from "react";
import { Link } from "expo-router";
import { View } from "react-native";
import { AuthShell, Field, FormError } from "@/components/AuthShell";
import { Button, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { authErrorKey, signIn } from "@/services/auth";
import { brand } from "@/lib/theme";

export default function Login() {
  const { t } = useT();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async () => {
    if (!id.trim() || !pw) return setErr(t("fillAll"));
    setBusy(true);
    setErr(null);
    try {
      await signIn(id, pw);
      // the root layout switches to the tabs once the session arrives
    } catch (e) {
      setErr(t(authErrorKey(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthShell title={t("login")} subtitle={t("sameAccount")}>
      <Field label={t("loginId")} value={id} onChangeText={setId} autoCapitalize="none" autoComplete="username" keyboardType="email-address" textContentType="username" />
      <Field label={t("password")} value={pw} onChangeText={setPw} secureTextEntry autoComplete="password" textContentType="password" onSubmitEditing={submit} />
      <FormError text={err} />
      <Button title={t("login")} onPress={submit} loading={busy} />
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 4 }}>
        <Link href="/forgot"><Txt color={brand.blue} w="medium">{t("forgot")}</Txt></Link>
      </View>
      <Link href="/register" style={{ marginTop: 12, alignSelf: "center" }}><Txt color={brand.blue} w="semibold">{t("noAccount")}</Txt></Link>
    </AuthShell>
  );
}
