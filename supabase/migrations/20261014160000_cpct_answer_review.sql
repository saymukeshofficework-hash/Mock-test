-- CPCT answer review: after submit, score_test_attempt also returns the answer key
-- (and explanation, when a question has one) for cpct-* tests only, so the result page
-- can show each question's correct answer. Other tests are unchanged.
-- Access is the same as before: test_content RLS decides who can read the test.
create or replace function public.score_test_attempt(p_test_id text, p_answers jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  v_questions jsonb;
  sec jsonb;
  sec_idx int := 0;
  q jsonb;
  q_idx int;
  sel jsonb;
  total_correct int := 0;
  total_incorrect int := 0;
  total_unattempted int := 0;
  total_score int := 0;
  rows jsonb := '[]'::jsonb;
  sec_c int; sec_ic int; sec_un int;
  want_key boolean := p_test_id like 'cpct-%';
  v_key jsonb := '[]'::jsonb;
  sec_key jsonb;
begin
  select tc.questions into v_questions
  from public.test_content tc
  where tc.test_id = p_test_id;

  if v_questions is null then
    raise exception 'test not found or not accessible';
  end if;

  for sec in select * from jsonb_array_elements(v_questions)
  loop
    sec_c := 0; sec_ic := 0; sec_un := 0;
    q_idx := 0;
    sec_key := '[]'::jsonb;
    for q in select * from jsonb_array_elements(sec->'questions')
    loop
      sel := p_answers -> sec_idx -> q_idx;
      if sel is null or sel = 'null'::jsonb then
        sec_un := sec_un + 1;
      elsif (sel)::int = (q->>'answer')::int then
        sec_c := sec_c + 1;
        total_score := total_score + 1;
      else
        sec_ic := sec_ic + 1;
      end if;
      if want_key then
        sec_key := sec_key || jsonb_build_array(jsonb_strip_nulls(jsonb_build_object(
          'a', (q->>'answer')::int,
          'e', coalesce(q->'explanation', jsonb_strip_nulls(jsonb_build_object(
                 'en', q->'en'->'explanation', 'hi', q->'hi'->'explanation')))
        )));
      end if;
      q_idx := q_idx + 1;
    end loop;
    total_correct := total_correct + sec_c;
    total_incorrect := total_incorrect + sec_ic;
    total_unattempted := total_unattempted + sec_un;
    rows := rows || jsonb_build_array(jsonb_build_object(
      'name', sec->>'name', 'total', jsonb_array_length(sec->'questions'),
      'c', sec_c, 'ic', sec_ic, 'un', sec_un
    ));
    if want_key then
      v_key := v_key || jsonb_build_array(sec_key);
    end if;
    sec_idx := sec_idx + 1;
  end loop;

  return jsonb_build_object(
    'score', total_score,
    'totalCorrect', total_correct,
    'totalIncorrect', total_incorrect,
    'totalUnattempted', total_unattempted,
    'rows', rows
  ) || case when want_key then jsonb_build_object('key', v_key) else '{}'::jsonb end;
end;
$$;
