import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, AppState, BackHandler, Linking, Modal, Pressable, ScrollView, View } from "react-native";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useQueryClient } from "@tanstack/react-query";
import { useKeepAwake } from "expo-keep-awake";
import { Bookmark, BookmarkCheck, Flag, Grid3x3, Clock, X } from "@/components/icons";
import { Button, Card, ErrorState, Loading, Txt } from "@/components/ui";
import { RichText } from "@/components/RichText";
import { PaletteModal, qState } from "@/components/Palette";
import { parseTestKey } from "@/data/catalog";
import { useT, pick } from "@/lib/i18n";
import { brand, radius, space, useColors } from "@/lib/theme";
import { useCtx } from "@/store/auth";
import { useSettings, type Lang } from "@/store/settings";
import { fetchTest, type FetchResult } from "@/services/tests";
import { createAttempt, discardAttempt, inProgressFor, saveProgress, type Attempt } from "@/services/attempts";
import { bookmarkedIndexes, removeBookmark, saveBookmark, saveTest } from "@/services/offline";
import { submitAttempt } from "@/services/submit";
import { markingText } from "@/lib/marking";
import { LINKS } from "@/lib/config";
import type { NTest } from "@/engine/types";

const L = ["A", "B", "C", "D", "E", "F"];

export default function TestScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const parsed = parseTestKey(String(key));
  const ctx = useCtx();
  const { t } = useT();
  const [load, setLoad] = useState<FetchResult | null>(null);
  const [existing, setExisting] = useState<Attempt | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const uid = ctx?.userId;

  const doLoad = useCallback(async () => {
    if (!parsed) return;
    setLoad(null);
    const [res, prev] = await Promise.all([fetchTest(parsed.series, parsed.n, ctx), uid ? inProgressFor(uid, String(key)) : Promise.resolve(null)]);
    setExisting(prev);
    setLoad(res);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, uid]);
  useEffect(() => { void doLoad(); }, [doLoad]);

  if (!parsed) return <Shell><ErrorState message={t("notFound")} /></Shell>;
  if (!load) return <Shell><Loading /></Shell>;
  if (load.status !== "ok") {
    const msg = load.status === "locked" ? t("lockedMsg") : load.status === "offline" ? t("offlineNoCopy") : load.status === "login" ? t("login") : t("loadError");
    return <Shell><ErrorState message={msg} onRetry={load.status === "locked" ? undefined : doLoad} /></Shell>;
  }
  if (!attempt) {
    return (
      <Instructions
        test={load.test}
        offline={!!load.offline}
        existing={existing}
        onStart={async (resume) => {
          if (!uid) return;
          if (resume && existing) return setAttempt(existing);
          if (existing) await discardAttempt(existing.id);
          await saveTest(uid, load.test, "session"); // encrypted copy for crash recovery / offline submit
          setAttempt(await createAttempt({ user_id: uid, test_key: String(key), series_id: parsed.series.id, n: parsed.n, total_sec: load.test.minutes * 60, q_count: load.test.questions.length, title: pick(load.test.title, "hi") || pick(load.test.title, "en") }));
        }}
      />
    );
  }
  return <Engine test={load.test} initial={attempt} />;
}

function Shell({ children }: { children: React.ReactNode }) {
  const c = useColors();
  const { t } = useT();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: space.md }}>
        <Pressable onPress={() => router.back()} accessibilityLabel={t("back")} hitSlop={10}><X color={c.text} size={24} /></Pressable>
      </View>
      {children}
    </SafeAreaView>
  );
}

function Instructions({ test, offline, existing, onStart }: { test: NTest; offline: boolean; existing: Attempt | null; onStart: (resume: boolean) => void }) {
  const { t, p, lang } = useT();
  const [busy, setBusy] = useState(false);
  const go = (resume: boolean) => { setBusy(true); onStart(resume); };
  const lines = [
    `${test.questions.length} ${t("questions")} · ${test.minutes} ${t("minutes")} · ${test.sections.length} ${t("sectionsLower")}`,
    markingText(test.scoring, lang, test.marks),
    t("instr1"), t("instr2"), t("instr3"), t("instr4"),
  ];
  return (
    <Shell>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <Txt w="bold" size={20}>{p(test.title)}</Txt>
        {offline ? <Txt color={brand.review} size={13}>{t("usingOffline")}</Txt> : null}
        <Card style={{ gap: space.sm }}>
          <Txt w="semibold">{t("instructions")}</Txt>
          {lines.map((l, i) => <Txt key={i} size={14}>{`• ${l}`}</Txt>)}
        </Card>
        <Card style={{ gap: 4 }}>
          <Txt w="semibold">{t("sections")}</Txt>
          {test.sections.map((s, i) => (
            <Txt key={i} size={14} muted>{`${i + 1}. ${p(s.name) || "—"} (${test.questions.filter((q) => q.section === i).length})`}</Txt>
          ))}
        </Card>
        {existing ? (
          <>
            <Button title={`${t("resume")} (${existing.answers.filter((a) => a !== null).length}/${existing.q_count})`} onPress={() => go(true)} loading={busy} />
            <Button title={t("startOver")} kind="secondary" onPress={() => Alert.alert(t("startOver"), t("startOverMsg"), [{ text: t("cancel"), style: "cancel" }, { text: t("startOver"), style: "destructive", onPress: () => go(false) }])} />
          </>
        ) : (
          <Button title={t("startTest")} onPress={() => go(false)} loading={busy} />
        )}
      </ScrollView>
    </Shell>
  );
}

function fmt(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function Engine({ test, initial }: { test: NTest; initial: Attempt }) {
  useKeepAwake();
  const { t, p } = useT();
  const c = useColors();
  const qc = useQueryClient();
  const navigation = useNavigation();
  const appLang = useSettings((s) => s.lang);
  const [lang, setLang] = useState<Lang>(appLang);
  const [cur, setCur] = useState(Math.min(initial.current, test.questions.length - 1));
  const [answers, setAnswers] = useState(initial.answers);
  const [marked, setMarked] = useState(initial.marked);
  const [visited, setVisited] = useState(() => { const v = [...initial.visited]; v[initial.current] = true; return v; });
  const [remaining, setRemaining] = useState(initial.remaining_sec);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set());
  const endAt = useRef(Date.now() + initial.remaining_sec * 1000);
  const done = useRef(false);
  const latest = useRef({ cur, answers, marked, visited, remaining });
  latest.current = { cur, answers, marked, visited, remaining };

  useEffect(() => { void bookmarkedIndexes(initial.user_id, initial.test_key).then(setBookmarks); }, [initial.user_id, initial.test_key]);

  const persist = useCallback(() => {
    const s = latest.current;
    if (done.current) return;
    void saveProgress({ id: initial.id, remaining_sec: Math.max(0, (endAt.current - Date.now()) / 1000), current: s.cur, answers: s.answers, marked: s.marked, visited: s.visited });
  }, [initial.id]);

  const submit = useCallback(async (auto: boolean) => {
    if (done.current) return;
    done.current = true;
    setSubmitting(true);
    setConfirmOpen(false);
    setPaletteOpen(false);
    const rem = auto ? 0 : Math.max(0, (endAt.current - Date.now()) / 1000);
    const s = latest.current;
    await saveProgress({ id: initial.id, remaining_sec: rem, current: s.cur, answers: s.answers, marked: s.marked, visited: s.visited });
    const out = await submitAttempt({ ...initial, answers: s.answers }, test, rem);
    void qc.invalidateQueries({ queryKey: ["attempts"] });
    if (auto) Alert.alert(t("timeUp"));
    router.replace({ pathname: "/result/[id]", params: { id: initial.id, queued: out.kind === "queued" ? "1" : "0" } });
  }, [initial, test, qc, t]);

  // Timer from an absolute end time, so it stays accurate when the JS thread is busy.
  useEffect(() => {
    const id = setInterval(() => {
      const left = (endAt.current - Date.now()) / 1000;
      setRemaining(left);
      if (left <= 0) void submit(true);
    }, 1000);
    const save = setInterval(persist, 5000);
    return () => { clearInterval(id); clearInterval(save); };
  }, [persist, submit]);

  // The clock pauses while the app is in the background or closed, and resumes from the saved time.
  useEffect(() => {
    let leftAt: number | null = null;
    const sub = AppState.addEventListener("change", (st) => {
      if (st !== "active") { persist(); leftAt = Date.now(); }
      else if (leftAt) { endAt.current += Date.now() - leftAt; leftAt = null; }
    });
    return () => sub.remove();
  }, [persist]);

  // Exit protection: back button and swipe ask first; answers are already saved.
  useEffect(() => {
    const ask = () => {
      Alert.alert(t("exitTest"), t("exitTestMsg"), [
        { text: t("stay"), style: "cancel" },
        { text: t("leave"), style: "destructive", onPress: () => { persist(); done.current = true; router.back(); } },
      ]);
      return true;
    };
    const bh = BackHandler.addEventListener("hardwareBackPress", ask);
    const unsub = navigation.addListener("beforeRemove", (e) => {
      if (done.current) return;
      e.preventDefault();
      ask();
    });
    return () => { bh.remove(); unsub(); };
  }, [navigation, persist, t]);

  const q = test.questions[cur]!;
  const states = useMemo(() => test.questions.map((_, i) => qState(answers[i] !== null && answers[i] !== undefined, !!visited[i], !!marked[i])), [answers, visited, marked, test.questions]);
  const counts = useMemo(() => ({
    answered: answers.filter((a) => a !== null && a !== undefined).length,
    marked: marked.filter(Boolean).length,
    notVisited: visited.filter((v) => !v).length,
  }), [answers, marked, visited]);

  const go = (i: number) => {
    const n = Math.max(0, Math.min(test.questions.length - 1, i));
    setCur(n);
    setVisited((v) => { if (v[n]) return v; const x = [...v]; x[n] = true; return x; });
    setTimeout(persist, 0);
  };
  const choose = (o: number) => { setAnswers((a) => { const x = [...a]; x[cur] = x[cur] === o ? x[cur] : o; return x; }); setTimeout(persist, 0); };
  const clear = () => { setAnswers((a) => { const x = [...a]; x[cur] = null; return x; }); setTimeout(persist, 0); };
  const toggleMark = () => setMarked((m) => { const x = [...m]; x[cur] = !x[cur]; return x; });
  const markAndNext = () => { setMarked((m) => { const x = [...m]; x[cur] = true; return x; }); go(cur + 1); };
  const toggleBookmark = async () => {
    const has = bookmarks.has(cur);
    if (has) await removeBookmark(initial.user_id, initial.test_key, cur);
    else await saveBookmark(initial.user_id, initial.test_key, cur, { title: test.title, section: test.sections[q.section]?.name, q: q.q, options: q.options, passage: q.passage, figure: q.figure, n: cur + 1 });
    setBookmarks((b) => { const x = new Set(b); if (has) x.delete(cur); else x.add(cur); return x; });
  };
  const report = () => {
    const text = `Question report / प्रश्न रिपोर्ट\n${pick(test.title, "en")}\nQ${cur + 1}`;
    Alert.alert(t("report"), t("reportMsg"), [
      { text: t("cancel"), style: "cancel" },
      { text: "WhatsApp", onPress: () => void Linking.openURL(`${LINKS.whatsapp}?text=${encodeURIComponent(text)}`) },
    ]);
  };

  const opts = lang === "hi" ? q.options.hi : q.options.en;
  const qText = pick(q.q, lang);
  const sectionName = (i: number) => pick(test.sections[i]?.name, lang) || `${t("section")} ${i + 1}`;
  const low = remaining < 300;
  const marks = test.marks ?? (test.scoring.kind === "rpcNeg3" ? { c: 1, w: 1 / 3 } : { c: 1, w: 0 });

  if (submitting) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, alignItems: "center", justifyContent: "center", gap: space.md }}>
        <ActivityIndicator color={brand.navy} size="large" />
        <Txt>{t("checking")}</Txt>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top", "bottom"]}>
      <View style={{ backgroundColor: c.header, paddingHorizontal: space.md, paddingVertical: space.sm, flexDirection: "row", alignItems: "center", gap: space.sm }}>
        <Txt w="semibold" color="#fff" size={14} numberOfLines={1} style={{ flex: 1 }}>{p(test.title)}</Txt>
        <View style={{ flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: radius.pill }}>
          {(["hi", "en"] as Lang[]).map((l) => (
            <Pressable key={l} onPress={() => setLang(l)} accessibilityLabel={l === "hi" ? "हिंदी" : "English"} style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: lang === l ? brand.yellow : "transparent" }}>
              <Txt w="semibold" size={12} color={lang === l ? "#1B2440" : "#fff"}>{l === "hi" ? "हि" : "EN"}</Txt>
            </Pressable>
          ))}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: low ? brand.error : "rgba(255,255,255,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.sm }} accessibilityLabel={`${t("timeLeft")} ${fmt(remaining)}`}>
          <Clock color="#fff" size={14} />
          <Txt w="bold" size={13} color="#fff">{fmt(remaining)}</Txt>
        </View>
        <Pressable onPress={() => setPaletteOpen(true)} accessibilityLabel={t("palette")} hitSlop={8}><Grid3x3 color="#fff" size={22} /></Pressable>
      </View>

      {test.sections.length > 1 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, borderBottomWidth: 1, borderBottomColor: c.border, backgroundColor: c.card }} contentContainerStyle={{ paddingHorizontal: space.sm }}>
          {test.sections.map((_, si) => {
            const first = test.questions.findIndex((x) => x.section === si);
            const active = q.section === si;
            return (
              <Pressable key={si} onPress={() => first >= 0 && go(first)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 3, borderBottomColor: active ? brand.navy : "transparent" }}>
                <Txt w={active ? "semibold" : "regular"} size={13} color={active ? brand.navy : c.muted}>{sectionName(si)}</Txt>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Txt w="semibold" size={14} color={brand.navy}>{`${t("question")} ${cur + 1}/${test.questions.length}`}</Txt>
          <Txt size={12} muted>{`+${marks.c} / −${marks.w === 1 / 3 ? "⅓" : marks.w}`}</Txt>
        </View>
        {q.passage ? (
          <View style={{ backgroundColor: c.chip, borderRadius: radius.sm, padding: space.md }}>
            <RichText value={pick(q.passage, lang)} size={14} />
          </View>
        ) : null}
        <RichText value={qText} size={17} w="medium" />
        {q.figure ? <RichText value={q.figure} /> : null}
        <View style={{ gap: space.sm }}>
          {opts.map((o, i) => {
            const sel = answers[cur] === i;
            return (
              <Pressable key={i} onPress={() => choose(i)} accessibilityRole="radio" accessibilityState={{ selected: sel }}
                style={{ flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md, borderRadius: radius.md, borderWidth: 2, borderColor: sel ? brand.navy : c.border, backgroundColor: sel ? c.selectedBg : c.card, minHeight: 52 }}>
                <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: sel ? brand.navy : c.chip, alignItems: "center", justifyContent: "center" }}>
                  <Txt w="bold" size={13} color={sel ? "#fff" : c.text}>{L[i] ?? i + 1}</Txt>
                </View>
                <View style={{ flex: 1 }}><RichText value={o} size={15} maxSvgWidth={220} /></View>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: space.sm }}>
          <ToolBtn label={marked[cur] ? t("unmark") : t("markReview")} active={!!marked[cur]} color={brand.review} icon={<Flag color={marked[cur] ? "#fff" : brand.review} size={16} />} onPress={toggleMark} />
          <ToolBtn label={t("bookmark")} active={bookmarks.has(cur)} color={brand.blue} icon={bookmarks.has(cur) ? <BookmarkCheck color="#fff" size={16} /> : <Bookmark color={brand.blue} size={16} />} onPress={() => void toggleBookmark()} />
          <ToolBtn label={t("report")} color={c.muted} onPress={report} />
          {answers[cur] !== null && answers[cur] !== undefined ? <ToolBtn label={t("clear")} color={brand.error} onPress={clear} /> : null}
        </View>
      </ScrollView>

      <View style={{ flexDirection: "row", gap: space.sm, padding: space.md, borderTopWidth: 1, borderTopColor: c.border, backgroundColor: c.card }}>
        <Button title={t("prev")} kind="secondary" small onPress={() => go(cur - 1)} disabled={cur === 0} style={{ flex: 1 }} />
        <Button title={t("review")} kind="secondary" small onPress={markAndNext} style={{ flex: 1 }} />
        {cur === test.questions.length - 1 ? (
          <Button title={t("submitShort")} kind="danger" small onPress={() => setConfirmOpen(true)} style={{ flex: 1.3 }} />
        ) : (
          <Button title={t("saveNext")} small onPress={() => go(cur + 1)} style={{ flex: 1.3 }} />
        )}
      </View>

      <PaletteModal visible={paletteOpen} onClose={() => setPaletteOpen(false)} test={test} states={states} current={cur} onJump={go} onSubmit={() => { setPaletteOpen(false); setConfirmOpen(true); }} sectionName={sectionName} />

      <Modal visible={confirmOpen} transparent animationType="fade" onRequestClose={() => setConfirmOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: space.xl }}>
          <View style={{ backgroundColor: c.card, borderRadius: radius.lg, padding: space.xl, gap: space.md }}>
            <Txt w="bold" size={18}>{t("submitConfirm")}</Txt>
            <Txt>{`${t("answered")}: ${counts.answered}`}</Txt>
            <Txt>{`${t("notAnswered")}: ${test.questions.length - counts.answered}`}</Txt>
            <Txt>{`${t("marked")}: ${counts.marked}`}</Txt>
            <Txt>{`${t("timeLeft")}: ${fmt(remaining)}`}</Txt>
            <View style={{ flexDirection: "row", gap: space.sm }}>
              <Button title={t("cancel")} kind="secondary" onPress={() => setConfirmOpen(false)} style={{ flex: 1 }} />
              <Button title={t("submitShort")} kind="danger" onPress={() => void submit(false)} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ToolBtn({ label, icon, onPress, active, color }: { label: string; icon?: React.ReactNode; onPress: () => void; active?: boolean; color: string }) {
  const c = useColors();
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1, borderColor: color, backgroundColor: active ? color : c.card, minHeight: 36 }}>
      {icon}
      <Txt size={13} w="medium" color={active ? "#fff" : color}>{label}</Txt>
    </Pressable>
  );
}
