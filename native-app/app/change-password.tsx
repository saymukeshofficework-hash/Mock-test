import React, { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { BackHeader } from "@/components/BackHeader";
import { Field, FormError } from "@/components/AuthShell";
import { Button, Screen, Txt } from "@/components/ui";
import { useT } from "@/lib/i18n";
import { space } from "@/lib/theme";
import { authErrorKey, updatePassword } from "@/services/auth";
import { useAuth } from "@/store/auth";

export default function ChangePassword() {
  const { t } = useT();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const recovery = useAuth((s) => s.recovery);
  const save = async () => {
    if (pw.length < 6) { setErr(t("passwordShort")); return; }
    setBusy(true); setErr(null);
    try { await updatePassword(pw); setOk(true); useAuth.setState({ recovery: false }); }
    catch (e) { setErr(t(authErrorKey(e))); }
    finally { setBusy(false); }
  };
  return (
    <Screen>
      <BackHeader title={t("changePassword")} />
      <View style={{ padding: space.lg, gap: space.md }}>
        {ok ? (
          <>
            <Txt w="semibold">{t("passwordChanged")}</Txt>
            <Button title={t("back")} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
          </>
        ) : (
          <>
            {recovery ? <Txt muted>{t("resetHelp")}</Txt> : null}
            <Field label={t("newPassword")} value={pw} onChangeText={setPw} secureTextEntry autoComplete="new-password" />
            <FormError text={err} />
            <Button title={t("savePassword")} loading={busy} onPress={save} />
          </>
        )}
      </View>
    </Screen>
  );
}
