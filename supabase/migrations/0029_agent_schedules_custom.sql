-- Custom scheduled reports: the customer's own words, on a clock.
--
-- Schedules could only ever invoke one of three skills we ship. Useful, and a ceiling: a realtor
-- who wants "every Monday, list the showings I have this week and flag any without a confirmed
-- time" had nowhere to put it, and the answer was a fixed list that did not contain it.
--
-- Two nullable columns, so every existing row keeps working untouched:
--
--   prompt  the instruction, in the customer's words. When set, the scheduled run sends THIS
--           instead of "run your <skill> skill now".
--   title   what to call it in the dashboard. Only meaningful for custom rows; the built-in
--           three are named in the UI.
--
-- NO NEW UNIQUE CONSTRAINT, because the existing one already does the right job. Custom rows
-- carry a skill of `custom:<slug-of-title>`, so unique (agent37_id, skill) means a customer can
-- have as many custom reports as they like and cannot have two called the same thing - which is
-- the same rule as "two daily briefs is a bug", applied to names they chose.

alter table public.agent_schedules
  add column if not exists prompt text,
  add column if not exists title  text;

-- A custom row is one with a prompt, and it must be identifiable as such from the skill alone -
-- the sweep, the API guard and the UI all branch on that prefix. Enforced here so a row that
-- would confuse all three cannot be written by any path, including by hand.
alter table public.agent_schedules
  drop constraint if exists agent_schedules_custom_shape;

alter table public.agent_schedules
  add constraint agent_schedules_custom_shape check (
    (prompt is null and skill not like 'custom:%')
    or
    (prompt is not null and skill like 'custom:%' and length(btrim(prompt)) > 0)
  );
